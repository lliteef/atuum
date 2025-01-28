import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateReleaseDialog } from "@/components/CreateReleaseDialog";

export default function Workstation() {
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

  const recentReleases = releases?.filter(release => 
    new Date(release.release_date) <= new Date()
  ) || [];

  const upcomingReleases = releases?.filter(release => 
    new Date(release.release_date) > new Date()
  ) || [];

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
    </div>
  );
}