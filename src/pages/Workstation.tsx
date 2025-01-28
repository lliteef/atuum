import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateReleaseDialog } from "@/components/CreateReleaseDialog";
import type { Database } from "@/integrations/supabase/types";

type ReleaseStatus = Database["public"]["Enums"]["release_status"];

export default function Workstation() {
  const [selectedStatus, setSelectedStatus] = useState<ReleaseStatus | "All">("All");

  useEffect(() => {
    document.title = "Workstation | IMG";
  }, []);

  const { data: releases } = useQuery({
    queryKey: ['releases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredReleases = releases?.filter(release => 
    selectedStatus === "All" ? true : release.status === selectedStatus
  ) || [];

  const recentReleases = releases?.filter(release => 
    new Date(release.release_date) <= new Date()
  ) || [];

  const upcomingReleases = releases?.filter(release => 
    new Date(release.release_date) > new Date()
  ) || [];

  const statusOptions: (ReleaseStatus | "All")[] = ["All", "In Progress", "Ready", "Moderation", "Sent to Stores"];

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
                        {new Date(release.release_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
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
                        {new Date(release.release_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
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
                  {release.label || 'No Label'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {release.upc ? `UPC: ${release.upc}` : 'No UPC'}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                release.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :
                release.status === 'Ready' ? 'bg-green-500/10 text-green-500' :
                release.status === 'Moderation' ? 'bg-blue-500/10 text-blue-500' :
                'bg-purple-500/10 text-purple-500'
              }`}>
                {release.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}