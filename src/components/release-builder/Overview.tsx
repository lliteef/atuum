import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Globe, Music2, Users2, AlertTriangle, Languages } from "lucide-react";
import { ReleaseData } from "@/pages/ReleaseBuilder";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OverviewProps {
  releaseData: ReleaseData;
  errors: string[];
  onNext: () => void;
}

export function Overview({ releaseData, errors, onNext }: OverviewProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the data from session storage to ensure we have the latest values
  const basicInfoData = JSON.parse(sessionStorage.getItem('basicInfoData') || '{}');
  
  // Merge the session storage data with the props data
  const mergedData = {
    ...releaseData,
    metadata_language: basicInfoData.metadata_language || releaseData.metadata_language,
    primary_artists: basicInfoData.primary_artists || releaseData.primary_artists || [],
    featured_artists: basicInfoData.featured_artists || releaseData.featured_artists || [],
    genre: basicInfoData.genre || releaseData.genre,
    subgenre: basicInfoData.subgenre || releaseData.subgenre,
  };

  const handleSubmitRelease = async () => {
    try {
      const { error } = await supabase
        .from('releases')
        .update({ status: 'Moderation' })
        .eq('id', releaseData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release has been submitted for moderation",
      });

      // Navigate back to the catalog
      navigate('/workstation');
    } catch (error) {
      console.error('Error submitting release:', error);
      toast({
        title: "Error",
        description: "Failed to submit release",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Please fix the following errors:</div>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info and Artwork Card */}
        <Card className="p-6">
          <div className="flex gap-6">
            {/* Artwork Preview */}
            {mergedData.artwork_url && (
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={mergedData.artwork_url}
                  alt="Release artwork"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Music2 className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Release Name</p>
                  <p className="font-medium">{mergedData.release_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UPC</p>
                  <p className="font-medium">{mergedData.upc || "Will be assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium">{mergedData.format}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-medium">{mergedData.genre || "Not specified"}</p>
                </div>
                {mergedData.subgenre && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subgenre</p>
                    <p className="font-medium">{mergedData.subgenre}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Metadata Language</p>
                  <p className="font-medium">{mergedData.metadata_language || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Artists Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Artists
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Primary Artists</p>
              <div className="flex flex-wrap gap-2">
                {mergedData.primary_artists?.length > 0 ? (
                  mergedData.primary_artists.map((artist) => (
                    <Badge key={artist} variant="secondary">
                      {artist}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No primary artists specified</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Featured Artists</p>
              <div className="flex flex-wrap gap-2">
                {mergedData.featured_artists?.length > 0 ? (
                  mergedData.featured_artists.map((artist) => (
                    <Badge key={artist} variant="secondary">
                      {artist}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No featured artists</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tracks Summary */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Tracks</h3>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {mergedData.tracks?.length > 0 ? (
                mergedData.tracks.map((track, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-lg bg-muted flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {track.title}
                        {track.version && ` (${track.version})`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ISRC: {track.isrc || "Will be assigned"}
                      </p>
                    </div>
                    {track.explicitContent !== "None" && (
                      <Badge variant={track.explicitContent === "Explicit" ? "destructive" : "default"}>
                        {track.explicitContent}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tracks added</p>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Distribution Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Selected Territories</p>
              <p className="font-medium">
                {mergedData.selected_territories?.length || 0} territories selected
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Selected Services</p>
              <p className="font-medium">
                {mergedData.selected_services?.length || 0} services selected
              </p>
            </div>
          </div>
        </Card>

        {/* Publishing Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Publishing</h3>
          <div>
            <p className="text-sm text-muted-foreground">Publishing Type</p>
            <p className="font-medium">{mergedData.publishing_type || "Not specified"}</p>
            {mergedData.publisher_name && (
              <p className="text-sm text-muted-foreground mt-2">
                Publisher: {mergedData.publisher_name}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSubmitRelease}
          disabled={errors.length > 0}
        >
          Submit Release
        </Button>
      </div>
    </div>
  );
}