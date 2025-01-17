import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Track {
  id: string;
  title: string;
  version?: string;
  isrc?: string;
  autoAssignIsrc: boolean;
  lyricsLanguage: string;
  explicitContent: "None" | "Explicit" | "Clean";
  lyrics?: string;
  primaryArtists: string[];
  featuredArtists: string[];
  remixers: string[];
  songwriters: string[];
  producers: string[];
  additionalContributors: {
    role: string;
    names: string[];
  }[];
  pLine: string;
}

const CONTRIBUTOR_ROLES = [
  "Co-Producer",
  "Lyricist",
  "Arranger",
  "Mastering Engineer",
  "Mixing Engineer",
  "Recording Engineer",
  "A&R Administrator",
];

const LANGUAGES = [
  { value: "instrumental", label: "Instrumental - No Lyrics" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  // Add more languages as needed
];

export function Tracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedTrack = tracks.find(track => track.id === selectedTrackId);
  const selectedTrackIndex = tracks.findIndex(track => track.id === selectedTrackId);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type !== "audio/wav") {
        toast({
          title: "Invalid file format",
          description: "Only WAV files are supported",
          variant: "destructive",
        });
        return;
      }

      const newTrack: Track = {
        id: crypto.randomUUID(),
        title: file.name.replace(".wav", ""),
        autoAssignIsrc: true,
        lyricsLanguage: "instrumental",
        explicitContent: "None",
        primaryArtists: [],
        featuredArtists: [],
        remixers: [],
        songwriters: [],
        producers: [],
        additionalContributors: [],
        pLine: `${new Date().getFullYear()} Records`,
      };

      setTracks(prev => [...prev, newTrack]);
      setSelectedTrackId(newTrack.id);

      toast({
        title: "Track uploaded",
        description: "Track has been added successfully",
      });
    });
  };

  const updateTrack = (trackId: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    ));
  };

  const getDisplayName = (track: Track) => {
    if (track.version) {
      return `${track.title} (${track.version})`;
    }
    return track.title;
  };

  const navigateTrack = (direction: "prev" | "next") => {
    if (!selectedTrackId) return;
    
    const currentIndex = tracks.findIndex(t => t.id === selectedTrackId);
    if (direction === "prev" && currentIndex > 0) {
      setSelectedTrackId(tracks[currentIndex - 1].id);
    } else if (direction === "next" && currentIndex < tracks.length - 1) {
      setSelectedTrackId(tracks[currentIndex + 1].id);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Track List Side */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tracks</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Track
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Track</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept=".wav"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="track-upload"
                  />
                  <Label
                    htmlFor="track-upload"
                    className="cursor-pointer block space-y-2"
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-500">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-400">
                      Only .WAV format supported
                    </div>
                  </Label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {tracks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track Name</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track) => (
                <TableRow
                  key={track.id}
                  className={`cursor-pointer ${
                    selectedTrackId === track.id ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  <TableCell>{getDisplayName(track)}</TableCell>
                  <TableCell>00:00</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No tracks uploaded yet
          </div>
        )}
      </div>

      {/* Track Details Side */}
      {selectedTrack ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Track Info</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Track Name (required)</Label>
                <Input
                  id="title"
                  value={selectedTrack.title}
                  onChange={(e) =>
                    updateTrack(selectedTrack.id, { title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={selectedTrack.version || ""}
                  onChange={(e) =>
                    updateTrack(selectedTrack.id, { version: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Track Name Displayed As</Label>
                <Input value={getDisplayName(selectedTrack)} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isrc">ISRC</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="isrc"
                    value={selectedTrack.isrc || ""}
                    onChange={(e) =>
                      updateTrack(selectedTrack.id, { isrc: e.target.value })
                    }
                    disabled={selectedTrack.autoAssignIsrc}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedTrack.autoAssignIsrc}
                      onCheckedChange={(checked) =>
                        updateTrack(selectedTrack.id, { autoAssignIsrc: checked })
                      }
                    />
                    <Label>Assign one for me</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Lyrics Language (required)</Label>
                <Select
                  value={selectedTrack.lyricsLanguage}
                  onValueChange={(value) =>
                    updateTrack(selectedTrack.id, { lyricsLanguage: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Explicit Content (required)</Label>
                <Select
                  value={selectedTrack.explicitContent}
                  onValueChange={(value: "None" | "Explicit" | "Clean") =>
                    updateTrack(selectedTrack.id, { explicitContent: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Explicit">Explicit</SelectItem>
                    <SelectItem value="Clean">Clean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lyrics">Track Lyrics</Label>
                <Textarea
                  id="lyrics"
                  value={selectedTrack.lyrics || ""}
                  onChange={(e) =>
                    updateTrack(selectedTrack.id, { lyrics: e.target.value })
                  }
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Artists and Contributors</h3>
            {/* Artists and Contributors fields will be implemented here */}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Master Rights</h3>
            <div>
              <Label htmlFor="pLine">℗ Line (required)</Label>
              <Input
                id="pLine"
                value={selectedTrack.pLine}
                onChange={(e) =>
                  updateTrack(selectedTrack.id, { pLine: e.target.value })
                }
                placeholder="2025 Amber Records"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => navigateTrack("prev")}
              disabled={selectedTrackIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit Previous Track
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateTrack("next")}
              disabled={selectedTrackIndex === tracks.length - 1}
            >
              Edit Next Track
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a track to view details
        </div>
      )}
    </div>
  );
}