import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, BarChart2 } from "lucide-react";
import { CreateReleaseDialog } from "@/components/CreateReleaseDialog";
import { useState } from "react";
import { format } from "date-fns";

interface Release {
  id: string;
  coverUrl: string;
  releaseName: string;
  artist: string;
  upc: string;
  status: "Moderation" | "Ready" | "Sent to Stores" | "Live";
  releaseDate: Date;
}

// Mock data - replace with actual data fetching logic
const mockReleases: Release[] = [
  {
    id: "1",
    coverUrl: "/placeholder.svg",
    releaseName: "Summer Vibes",
    artist: "DJ Cool",
    upc: "123456789012",
    status: "Live",
    releaseDate: new Date(2024, 2, 15),
  },
  {
    id: "2",
    coverUrl: "/placeholder.svg",
    releaseName: "Winter Dreams",
    artist: "Frosty Band",
    upc: "123456789013",
    status: "Live",
    releaseDate: new Date(2024, 3, 1),
  },
  {
    id: "3",
    coverUrl: "/placeholder.svg",
    releaseName: "Spring Collection",
    artist: "Nature Sounds",
    upc: "123456789014",
    status: "Moderation",
    releaseDate: new Date(2024, 4, 20),
  },
];

export default function Workstation() {
  const [selectedStatus, setSelectedStatus] = useState<Release["status"] | "All">("All");
  const today = new Date();

  const recentReleases = mockReleases
    .filter(release => release.releaseDate <= today)
    .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime())
    .slice(0, 3);

  const upcomingReleases = mockReleases
    .filter(release => release.releaseDate > today)
    .sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime())
    .slice(0, 3);

  const filteredReleases = selectedStatus === "All" 
    ? mockReleases 
    : mockReleases.filter(release => release.status === selectedStatus);

  const statuses: Release["status"][] = ["Moderation", "Ready", "Sent to Stores", "Live"];

  return (
    <div className="p-6 space-y-6">
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
                    <span>{release.releaseName}</span>
                    <span className="text-gray-400">
                      {format(release.releaseDate, "MMM d, yyyy")}
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
                    <span>{release.releaseName}</span>
                    <span className="text-gray-400">
                      {format(release.releaseDate, "MMM d, yyyy")}
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
            >
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
                src={release.coverUrl}
                alt={release.releaseName}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{release.releaseName}</h3>
                <p className="text-sm text-gray-400 truncate">{release.artist}</p>
              </div>
              <div className="text-sm text-gray-400">{release.upc}</div>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded ${
                  release.status === "Live" ? "bg-green-500/20 text-green-400" :
                  release.status === "Moderation" ? "bg-yellow-500/20 text-yellow-400" :
                  release.status === "Ready" ? "bg-blue-500/20 text-blue-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {release.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}