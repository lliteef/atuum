import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateReleaseDialog } from "@/components/CreateReleaseDialog";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface Release {
  id: string;
  artwork_url: string | null;
  release_name: string;
  primary_artists: string[];
  upc: string | null;
  status: "Moderation" | "Ready" | "Sent to Stores" | "In Progress";
  release_date: string | null;
}

export default function Workstation() {
  const [selectedStatus, setSelectedStatus] = useState<Release["status"] | "All">("All");
  const [releases, setReleases] = useState<Release[]>([]);
  const [userInfo, setUserInfo] = useState<{
    email: string | undefined;
    id: string | undefined;
    roles: Database['public']['Enums']['app_role'][];
  }>({
    email: undefined,
    id: undefined,
    roles: [],
  });

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase.rpc('get_user_roles', {
          user_id: user.id
        });
        setUserInfo({
          email: user.email,
          id: user.id,
          roles: roles || [],
        });
      }
    };
    getUserInfo();
  }, []);

  useEffect(() => {
    const fetchReleases = async () => {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching releases:', error);
        return;
      }

      setReleases(data || []);
    };

    fetchReleases();
  }, []);

  const today = new Date();

  const recentReleases = releases
    .filter(release => release.release_date && new Date(release.release_date) <= today)
    .sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime())
    .slice(0, 3);

  const upcomingReleases = releases
    .filter(release => release.release_date && new Date(release.release_date) > today)
    .sort((a, b) => new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime())
    .slice(0, 3);

  const filteredReleases = selectedStatus === "All" 
    ? releases 
    : releases.filter(release => release.status === selectedStatus);

  const statuses: Release["status"][] = ["In Progress", "Ready", "Moderation", "Sent to Stores"];

  const getStatusColor = (status: Release["status"]) => {
    switch (status) {
      case "In Progress":
        return "bg-[#FEF7CD] text-yellow-800";
      case "Ready":
        return "bg-[#F2FCE2] text-green-800";
      case "Moderation":
        return "bg-[#D3E4FD] text-blue-800";
      case "Sent to Stores":
        return "bg-[#9b87f5] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Catalog</h1>
          <CreateReleaseDialog />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card hover:bg-card/90 transition-colors">
            <CardHeader>
              <CardTitle>Recent Releases</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReleases.length > 0 ? (
                <div className="space-y-2">
                  {recentReleases.map(release => (
                    <div key={release.id} className="flex justify-between text-sm">
                      <span>{release.release_name}</span>
                      <span className="text-gray-400">
                        {release.release_date ? format(new Date(release.release_date), "MMM d, yyyy") : 'No date'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No recent releases</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:bg-card/90 transition-colors">
            <CardHeader>
              <CardTitle>Upcoming Releases</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReleases.length > 0 ? (
                <div className="space-y-2">
                  {upcomingReleases.map(release => (
                    <div key={release.id} className="flex justify-between text-sm">
                      <span>{release.release_name}</span>
                      <span className="text-gray-400">
                        {release.release_date ? format(new Date(release.release_date), "MMM d, yyyy") : 'No date'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No upcoming releases</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === "All" ? "default" : "outline"}
              onClick={() => setSelectedStatus("All")}
            >
              All
            </Button>
            {statuses.map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                onClick={() => setSelectedStatus(status)}
                className={selectedStatus === status ? "" : "hover:bg-gray-100"}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  getStatusColor(status).split(" ")[0]
                }`}></span>
                {status}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredReleases.map(release => (
              <div
                key={release.id}
                className="flex items-center gap-4 p-4 bg-card rounded-lg hover:bg-card/90 transition-colors"
              >
                <img
                  src={release.artwork_url || "/placeholder.svg"}
                  alt={release.release_name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{release.release_name}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {release.primary_artists?.join(', ') || 'No artists'}
                  </p>
                </div>
                <div className="text-sm text-gray-400">{release.upc || 'No UPC'}</div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded ${getStatusColor(release.status)}`}>
                    {release.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}