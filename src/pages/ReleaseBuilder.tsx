import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Upload } from "lucide-react";

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
  status?: "In Progress" | "Ready" | "Moderation" | "Sent to Stores";
}

export default function ReleaseBuilder() {
  useEffect(() => {
    document.title = "Release Builder | IMG";
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Release Builder</h1>
      
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
              <Input id="title" placeholder="Enter release title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Primary Artist</Label>
              <Input id="artist" placeholder="Enter primary artist name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input id="genre" placeholder="Enter primary genre" />
            </div>
            <Button className="w-full">Save Release Info</Button>
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