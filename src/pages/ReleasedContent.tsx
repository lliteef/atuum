
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Maximize2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function ReleasedContent() {
  const navigate = useNavigate();

  const { data: releases } = useQuery({
    queryKey: ['releases', 'sent-to-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('status', 'Sent to Stores')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const formatArtists = (primaryArtists?: string[] | null, featuredArtists?: string[] | null) => {
    const primary = primaryArtists?.join(", ") || "";
    const featured = featuredArtists?.length ? ` feat. ${featuredArtists.join(", ")}` : "";
    return primary || featured ? `${primary}${featured}` : "No artists";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Released Content</h1>
      <div className="space-y-4">
        {releases?.map((release) => (
          <Card 
            key={release.id} 
            className="p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => navigate(`/release-viewer/${release.id}`)}
              >
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
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => navigate(`/release-builder/${release.id}`)}>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Full View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
