import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Globe, Music2, Users2 } from "lucide-react";

interface OverviewProps {
  onNext: () => void;
  releaseData?: {
    releaseName: string;
    upc?: string;
    catalogNumber: string;
    format: string;
    primaryArtists?: string[];
    featuredArtists?: string[];
    genre?: string;
    subgenre?: string;
    label?: string;
    artworkUrl?: string;
    tracks?: {
      title: string;
      version?: string;
      isrc?: string;
      explicitContent: "None" | "Explicit" | "Clean";
    }[];
    releaseDate?: Date;
    salesStartDate?: Date;
    presaveOption?: string;
    presaveDate?: Date;
    pricing?: string;
    selectedTerritories?: string[];
    selectedServices?: string[];
    publishingType?: string;
    publisherName?: string;
  };
}

export function Overview({ onNext, releaseData }: OverviewProps) {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>
      
      <div className="grid gap-6">
        {/* Basic Info Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Release Name</p>
              <p className="font-medium">{releaseData?.releaseName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">UPC</p>
              <p className="font-medium">{releaseData?.upc || "Will be assigned"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Catalog Number</p>
              <p className="font-medium">{releaseData?.catalogNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Format</p>
              <p className="font-medium">{releaseData?.format}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Genre</p>
              <p className="font-medium">{releaseData?.genre || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subgenre</p>
              <p className="font-medium">{releaseData?.subgenre || "Not specified"}</p>
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
                {releaseData?.primaryArtists?.map((artist) => (
                  <Badge key={artist} variant="secondary">
                    {artist}
                  </Badge>
                )) || "No primary artists"}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Featured Artists</p>
              <div className="flex flex-wrap gap-2">
                {releaseData?.featuredArtists?.map((artist) => (
                  <Badge key={artist} variant="secondary">
                    {artist}
                  </Badge>
                )) || "No featured artists"}
              </div>
            </div>
          </div>
        </Card>

        {/* Artwork Preview */}
        {releaseData?.artworkUrl && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Artwork</h3>
            <img
              src={releaseData.artworkUrl}
              alt="Release artwork"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </Card>
        )}

        {/* Tracks Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tracks</h3>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {releaseData?.tracks?.map((track, index) => (
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
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Scheduling Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling and Pricing
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Release Date</p>
              <p className="font-medium">
                {releaseData?.releaseDate?.toLocaleDateString() || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sales Start Date</p>
              <p className="font-medium">
                {releaseData?.salesStartDate?.toLocaleDateString() || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pre-save Option</p>
              <p className="font-medium">{releaseData?.presaveOption || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pricing</p>
              <p className="font-medium">{releaseData?.pricing || "Mid"}</p>
            </div>
          </div>
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
                {releaseData?.selectedTerritories?.length || 0} territories selected
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Selected Services</p>
              <p className="font-medium">
                {releaseData?.selectedServices?.length || 0} services selected
              </p>
            </div>
          </div>
        </Card>

        {/* Publishing Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Publishing</h3>
          <div>
            <p className="text-sm text-muted-foreground">Publishing Type</p>
            <p className="font-medium">{releaseData?.publishingType || "Not specified"}</p>
            {releaseData?.publisherName && (
              <p className="text-sm text-muted-foreground mt-2">
                Publisher: {releaseData.publisherName}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={onNext}>
          Submit Release
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}