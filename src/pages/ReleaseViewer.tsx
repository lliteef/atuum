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

export default function ReleaseViewer() {
  const { id } = useParams();
  const { toast } = useToast();
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  if (!release) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{release.release_name}</h1>
          {release.status === 'Moderation' && (
            <div className="flex gap-4">
              <Button onClick={handleApprove} variant="default">
                Approve
              </Button>
              <Button 
                onClick={() => setRejectionDialogOpen(true)} 
                variant="destructive"
              >
                Reject
              </Button>
            </div>
          )}
        </div>
        <Overview 
          releaseData={release}
          errors={[]}
          onNext={() => {}}
        />
      </div>

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