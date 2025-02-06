import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateReleaseDialog } from "@/components/CreateReleaseDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ReleaseStatus = Database["public"]["Enums"]["release_status"];

export default function Workstation() {
  const [selectedStatus, setSelectedStatus] = useState<ReleaseStatus | "All">("All");
  const [takedownDialogOpen, setTakedownDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Workstation | IMG";
  }, []);

  const { data: userRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      return (data || []).map(r => r.role);
    }
  });

  const isModerator = userRoles?.includes('moderator');

  const { data: releases, refetch } = useQuery({
    queryKey: ['releases'],
    queryFn: async () => {
      let query = supabase
        .from('releases')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is a moderator, show only releases in Moderation status
      if (isModerator) {
        query = query.eq('status', 'Moderation');
      } else {
        // For regular users, show their own releases
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('created_by', user.id);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userRoles,
  });

  const handleEdit = (release: any) => {
    // If the release was previously sent to stores, set it back to moderation
    if (release.status === "Sent to Stores") {
      supabase
        .from('releases')
        .update({ status: "Moderation" })
        .eq('id', release.id)
        .then(() => {
          navigate(`/release-builder/${release.id}`);
        });
    } else {
      navigate(`/release-builder/${release.id}`);
    }
  };

  const handleTakedownClick = (release: any) => {
    setSelectedRelease(release);
    setTakedownDialogOpen(true);
    setShowPasswordInput(false);
    setPassword("");
  };

  const handleTakedownConfirm = async () => {
    if (!showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('releases')
        .update({ status: "Taken Down" })
        .eq('id', selectedRelease.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release has been taken down",
      });

      setTakedownDialogOpen(false);
      setSelectedRelease(null);
      setPassword("");
      setShowPasswordInput(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to take down release",
        variant: "destructive",
      });
    }
  };

  const filteredReleases = releases?.filter(release => 
    selectedStatus === "All" ? true : release.status === selectedStatus
  ) || [];

  const recentReleases = releases?.filter(release => 
    new Date(release.release_date) <= new Date()
  ) || [];

  const upcomingReleases = releases?.filter(release => 
    new Date(release.release_date) > new Date()
  ) || [];

  const statusOptions: (ReleaseStatus | "All")[] = ["All", "In Progress", "Ready", "Moderation", "Sent to Stores", "Taken Down"];

  const formatArtists = (primaryArtists?: string[] | null, featuredArtists?: string[] | null) => {
    const primary = primaryArtists?.join(", ") || "";
    const featured = featuredArtists?.length ? ` feat. ${featuredArtists.join(", ")}` : "";
    return primary || featured ? `${primary}${featured}` : "No artists";
  };

  const getStatusColor = (status: ReleaseStatus) => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-500/10 text-yellow-500";
      case "Ready":
        return "bg-green-500/10 text-green-500";
      case "Moderation":
        return "bg-blue-500/10 text-blue-500";
      case "Sent to Stores":
        return "bg-purple-500/10 text-purple-500";
      case "Taken Down":
        return "bg-red-500/10 text-red-500";
      case "Error":
        return "bg-red-600/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Catalog</h1>
        <CreateReleaseDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Releases */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Recent Releases</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReleases.length > 0 ? (
              <div className="space-y-4">
                {recentReleases.map((release) => (
                  <div key={release.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{release.release_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatArtists(release.primary_artists, release.featured_artists)}
                      </p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${getStatusColor(release.status)}`}>
                      {release.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent releases</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Releases */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Upcoming Releases</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReleases.length > 0 ? (
              <div className="space-y-4">
                {upcomingReleases.map((release) => (
                  <div key={release.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{release.release_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatArtists(release.primary_artists, release.featured_artists)}
                      </p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${getStatusColor(release.status)}`}>
                      {release.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming releases</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            onClick={() => setSelectedStatus(status)}
            size="sm"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* All Releases List */}
      <div className="space-y-4">
        {filteredReleases.map((release) => (
          <div 
            key={release.id} 
            className="flex items-center justify-between p-4 bg-card rounded-lg border"
          >
            <div className="flex items-center gap-4">
              {release.artwork_url ? (
                <img 
                  src={release.artwork_url} 
                  alt={release.release_name}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No Art</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{release.release_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatArtists(release.primary_artists, release.featured_artists)}
                </p>
                {release.status === "Error" && release.rejection_reason && (
                  <p className="text-sm text-red-500 mt-1">
                    Rejected: {release.rejection_reason}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {release.upc ? `UPC: ${release.upc}` : 'No UPC'}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${getStatusColor(release.status)}`}>
                {release.status}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-[200px] bg-popover"
                >
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(release);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  {isModerator && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/release-viewer/${release.id}`);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      View as Moderator
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTakedownClick(release);
                    }}
                    className="text-red-500 focus:text-red-500"
                  >
                    Takedown
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Takedown Confirmation Dialog */}
      <Dialog open={takedownDialogOpen} onOpenChange={setTakedownDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Takedown</DialogTitle>
            <DialogDescription>
              Are you sure you want to take down release "{selectedRelease?.release_name}"?
            </DialogDescription>
          </DialogHeader>
          {showPasswordInput && (
            <div className="py-4">
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTakedownDialogOpen(false);
                setShowPasswordInput(false);
                setPassword("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleTakedownConfirm}>
              {showPasswordInput ? "Confirm" : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}