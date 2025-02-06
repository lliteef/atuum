import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Overview } from "@/components/release-builder/Overview";
import { Label } from "@/components/ui/label";

export default function ReleaseViewer() {
  const { id } = useParams();
  const { toast } = useToast();
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [upcDialogOpen, setUpcDialogOpen] = useState(false);
  const [isrcDialogOpen, setIsrcDialogOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [upcValue, setUpcValue] = useState("");
  const [isrcValue, setIsrcValue] = useState("");

  const { data: release, refetch } = useQuery({
    queryKey: ['release', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('releases')
        .select('*, tracks(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

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

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({ status: 'Sent to Stores' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release has been approved and sent to stores",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve release",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('releases')
        .update({ 
          status: 'Error',
          rejection_reason: rejectionReason 
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release has been rejected",
      });

      setRejectionDialogOpen(false);
      setRejectionReason("");
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject release",
        variant: "destructive",
      });
    }
  };

  const handleAssignUPC = async () => {
    if (!upcValue) {
      toast({
        title: "Error",
        description: "Please enter a UPC code",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('releases')
        .update({ upc: upcValue })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "UPC has been assigned",
      });

      setUpcDialogOpen(false);
      setUpcValue("");
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign UPC",
        variant: "destructive",
      });
    }
  };

  const handleAssignISRC = async () => {
    if (!isrcValue) {
      toast({
        title: "Error",
        description: "Please enter an ISRC code",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tracks')
        .update({ isrc: isrcValue })
        .eq('id', selectedTrackId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "ISRC has been assigned",
      });

      setIsrcDialogOpen(false);
      setIsrcValue("");
      setSelectedTrackId("");
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign ISRC",
        variant: "destructive",
      });
    }
  };

  if (!release) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{release.release_name}</h1>
          {isModerator && (
            <div className="flex gap-4">
              {!release.upc && (
                <Button onClick={() => setUpcDialogOpen(true)} variant="outline">
                  Assign UPC
                </Button>
              )}
              {release.status === 'Moderation' && (
                <>
                  <Button onClick={handleApprove} variant="default">
                    Approve
                  </Button>
                  <Button 
                    onClick={() => setRejectionDialogOpen(true)} 
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <Overview 
          releaseData={release}
          errors={[]}
          onNext={() => {}}
        />

        {/* Track ISRC Assignment Section */}
        {isModerator && release.tracks && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Track ISRC Management</h2>
            <div className="space-y-4">
              {release.tracks.map((track: any) => (
                <div key={track.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{track.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ISRC: {track.isrc || "Not assigned"}
                    </p>
                  </div>
                  {!track.isrc && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTrackId(track.id);
                        setIsrcDialogOpen(true);
                      }}
                    >
                      Assign ISRC
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* UPC Assignment Dialog */}
      <Dialog open={upcDialogOpen} onOpenChange={setUpcDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign UPC</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="upc">UPC Code</Label>
            <Input
              id="upc"
              placeholder="Enter UPC code"
              value={upcValue}
              onChange={(e) => setUpcValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUpcDialogOpen(false);
                setUpcValue("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignUPC}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ISRC Assignment Dialog */}
      <Dialog open={isrcDialogOpen} onOpenChange={setIsrcDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign ISRC</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="isrc">ISRC Code</Label>
            <Input
              id="isrc"
              placeholder="Enter ISRC code"
              value={isrcValue}
              onChange={(e) => setIsrcValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsrcDialogOpen(false);
                setIsrcValue("");
                setSelectedTrackId("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignISRC}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Release</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectionDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReject} variant="destructive">
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}