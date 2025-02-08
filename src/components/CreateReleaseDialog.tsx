
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Disc, Music, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type ReleaseType = "Digital" | "Music Video" | "Physical";
type ReleaseFormat = "Album/Full Length" | "EP" | "Single";

export function CreateReleaseDialog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [releaseType, setReleaseType] = useState<ReleaseType | null>(null);
  const [format, setFormat] = useState<ReleaseFormat | null>(null);
  const [releaseName, setReleaseName] = useState("");
  const [releaseNo, setReleaseNo] = useState("");
  const [releaseVersion, setReleaseVersion] = useState("");
  const [hasUPC, setHasUPC] = useState<boolean>(false);
  const [upcNumber, setUpcNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user roles with proper error handling
  const { data: userRoles, isLoading: isLoadingRoles, error: rolesError } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return roles?.map(r => r.role) || [];
    },
    retry: false
  });

  // Handle error display using useEffect
  useEffect(() => {
    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      toast({
        title: "Error",
        description: "Failed to load user permissions. Please try again.",
        variant: "destructive",
      });
    }
  }, [rolesError, toast]);

  const isLabelAdmin = userRoles?.includes('label_admin');
  const isSystemAdmin = userRoles?.includes('system_admin');

  // Filter release types based on user role - updated to include Physical for label_admin
  const availableReleaseTypes: ReleaseType[] = (() => {
    if (isSystemAdmin) return ["Digital", "Music Video", "Physical"];
    if (isLabelAdmin) return ["Digital", "Music Video", "Physical"];
    return ["Digital"];
  })();

  // Reset release type if it's no longer available for the user's role
  useEffect(() => {
    if (releaseType && !availableReleaseTypes.includes(releaseType)) {
      setReleaseType(null);
    }
  }, [availableReleaseTypes, releaseType]);

  const handleCreateRelease = async () => {
    if (!releaseType || !format || !releaseName || !releaseNo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data: release, error } = await supabase
        .from('releases')
        .insert({
          release_name: releaseName,
          upc: hasUPC ? upcNumber : null,
          catalog_number: releaseNo,
          format,
          status: "In Progress",
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (!release) throw new Error("No release data returned");

      toast({
        title: "Success",
        description: "Release created successfully",
      });

      navigate(`/release-builder/${release.id}`);
    } catch (error) {
      console.error('Error creating release:', error);
      toast({
        title: "Error",
        description: "Failed to create release",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Release
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Release</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Release Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Type *</label>
            <div className="flex gap-4">
              {!isLoadingRoles && !rolesError && availableReleaseTypes.map((type) => {
                const Icon = type === "Digital" ? Music : type === "Music Video" ? Video : Disc;
                return (
                  <Button
                    key={type}
                    variant={releaseType === type ? "default" : "outline"}
                    className={cn(
                      "flex-1 gap-2",
                      releaseType === type ? "bg-primary text-primary-foreground" : ""
                    )}
                    onClick={() => setReleaseType(type)}
                  >
                    <Icon className="w-4 h-4" />
                    {type}
                  </Button>
                );
              })}
              {isLoadingRoles && (
                <div className="w-full text-center text-muted-foreground">
                  Loading available release types...
                </div>
              )}
              {rolesError && (
                <div className="w-full text-center text-destructive">
                  Error loading release types. Please try again.
                </div>
              )}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format *</label>
            <div className="flex gap-4">
              {["Album/Full Length", "EP", "Single"].map((formatOption) => (
                <Button
                  key={formatOption}
                  variant={format === formatOption ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    format === formatOption ? "bg-primary text-primary-foreground" : ""
                  )}
                  onClick={() => setFormat(formatOption as ReleaseFormat)}
                >
                  {formatOption}
                </Button>
              ))}
            </div>
          </div>

          {/* Release Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Name *</label>
            <Input
              placeholder="Enter release name"
              value={releaseName}
              onChange={(e) => setReleaseName(e.target.value)}
            />
          </div>

          {/* Release No. */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catalog No. *</label>
            <Input
              placeholder="AAM003"
              value={releaseNo}
              onChange={(e) => setReleaseNo(e.target.value)}
            />
          </div>

          {/* Release Version */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Version</label>
            <Input
              placeholder="Enter release version (optional)"
              value={releaseVersion}
              onChange={(e) => setReleaseVersion(e.target.value)}
            />
          </div>

          {/* UPC */}
          <div className="space-y-2">
            <label className="text-sm font-medium">UPC *</label>
            <div className="flex gap-4">
              <Button
                variant={!hasUPC ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setHasUPC(false);
                  setUpcNumber("");
                }}
              >
                Assign one for me
              </Button>
              <Button
                variant={hasUPC ? "default" : "outline"}
                className="flex-1"
                onClick={() => setHasUPC(true)}
              >
                I already have one
              </Button>
            </div>
            {hasUPC && (
              <Input
                placeholder="Enter UPC number"
                value={upcNumber}
                onChange={(e) => setUpcNumber(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Create Release Button */}
          <Button
            className="w-full"
            onClick={handleCreateRelease}
            disabled={!releaseType || !format || !releaseName || !releaseNo || isLoading}
          >
            {isLoading ? "Creating..." : "Create Release"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
