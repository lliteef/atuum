import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface ReleaseData {
  releaseName: string;
  upc?: string;
  catalogNumber: string;
  format: string;
  metadataLanguage?: string;
  primaryArtists?: string[];
  featuredArtists?: string[];
  genre?: string;
  subgenre?: string;
  label?: string;
  copyrightLine?: string;
  artworkUrl?: string;
  tracks?: Array<{
    title: string;
    version?: string;
    isrc?: string;
    explicitContent?: "None" | "Explicit" | "Clean";
  }>;
  releaseDate?: Date;
  salesStartDate?: Date;
  presaveOption?: string;
  presaveDate?: Date;
  pricing?: string;
  selectedTerritories?: string[];
  selectedServices?: string[];
  publishingType?: string;
  publisherName?: string;
  status?: "In Progress" | "Ready" | "Moderation" | "Sent to Stores" | "Taken Down";
}

export default function ReleaseBuilder() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: release, isLoading } = useQuery({
    queryKey: ['release', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load release data",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    document.title = `${release?.release_name || 'Release Builder'} | IMG`;
  }, [release?.release_name]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Release Builder - {release?.release_name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Music className="w-5 h-5" />
              <span>Release Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Release Title</Label>
              <Input 
                id="title" 
                value={release?.release_name || ''} 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Primary Artist</Label>
              <Input 
                id="artist" 
                value={release?.primary_artists?.join(', ') || ''} 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input 
                id="genre" 
                value={release?.genre || ''} 
                disabled
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Tracks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-2">
                Drag and drop your audio files here
              </p>
              <Button variant="outline">Browse Files</Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Supported formats: WAV, FLAC, AIFF (24-bit recommended)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}