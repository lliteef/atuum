import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(`/release-viewer/${release.id}`)}
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
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}