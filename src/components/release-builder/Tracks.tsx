import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, ArrowLeft, ArrowRight, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    currentName?: string;
  }[];
  pLine: string;
  audioUrl?: string;
  audioFilename?: string;
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

interface TracksProps {
  initialData?: {
    tracks?: Track[];
  };
  onTracksUpdate?: (tracks: Track[]) => void;
  onNext?: () => void;
}

export function Tracks({ initialData, onTracksUpdate, onNext }: TracksProps) {
  const [tracks, setTracks] = useState<Track[]>(initialData?.tracks || []);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    onTracksUpdate?.(tracks);
  }, [tracks, onTracksUpdate]);

  const selectedTrack = tracks.find(track => track.id === selectedTrackId);
  const selectedTrackIndex = tracks.findIndex(track => track.id === selectedTrackId);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload tracks",
        variant: "destructive",
      });
      return;
    }

    for (const file of Array.from(files)) {
      try {
        const { url, filename, filePath } = await uploadAudioFile(file, user.id);
        
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
          audioUrl: url,
          audioFilename: filename,
        };

        // Save track metadata to Supabase
        const { error: dbError } = await supabase
          .from('tracks')
          .insert({
            title: newTrack.title,
            version: newTrack.version,
            isrc: newTrack.isrc,
            lyrics_language: newTrack.lyricsLanguage,
            explicit_content: newTrack.explicitContent,
            lyrics: newTrack.lyrics,
            primary_artists: newTrack.primaryArtists,
            featured_artists: newTrack.featuredArtists,
            remixers: newTrack.remixers,
            songwriters: newTrack.songwriters,
            producers: newTrack.producers,
            additional_contributors: newTrack.additionalContributors,
            p_line: newTrack.pLine,
            audio_url: url,
            audio_filename: filename,
            created_by: user.id
          });

        if (dbError) {
          throw new Error(`Failed to save track metadata: ${dbError.message}`);
        }

        setTracks(prev => [...prev, newTrack]);
        setSelectedTrackId(newTrack.id);

        toast({
          title: "Track uploaded",
          description: "Track has been added successfully",
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
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

  const handleArtistKeyDown = (
    e: React.KeyboardEvent,
    type: "primary" | "featured" | "remixers" | "songwriters" | "producers",
    currentValue: string,
    setter: (value: string) => void,
    arraySetter: (value: string[]) => void,
    currentArray: string[]
  ) => {
    if (e.key === "Enter" && currentValue.trim()) {
      arraySetter([...currentArray, currentValue.trim()]);
      setter("");
    }
  };

  const removeArtist = (
    artist: string,
    arraySetter: (value: string[]) => void,
    currentArray: string[]
  ) => {
    arraySetter(currentArray.filter((a) => a !== artist));
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
            
            {/* Primary Artists */}
            <div>
              <Label>Primary Artist(s) (required)</Label>
              <Input
                value={selectedTrack.currentPrimaryArtist || ""}
                onChange={(e) =>
                  updateTrack(selectedTrack.id, { currentPrimaryArtist: e.target.value })
                }
                onKeyDown={(e) =>
                  handleArtistKeyDown(
                    e,
                    "primary",
                    selectedTrack.currentPrimaryArtist || "",
                    (value) => updateTrack(selectedTrack.id, { currentPrimaryArtist: value }),
                    (value) => updateTrack(selectedTrack.id, { primaryArtists: value }),
                    selectedTrack.primaryArtists
                  )
                }
                placeholder="Type artist name and press Enter"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTrack.primaryArtists.map((artist) => (
                  <Badge key={artist} variant="secondary" className="flex items-center gap-1">
                    {artist}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        removeArtist(
                          artist,
                          (value) => updateTrack(selectedTrack.id, { primaryArtists: value }),
                          selectedTrack.primaryArtists
                        )
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Featured Artists */}
            <div>
              <Label>Featured Artist(s)</Label>
              <Input
                value={selectedTrack.currentFeaturedArtist || ""}
                onChange={(e) =>
                  updateTrack(selectedTrack.id, { currentFeaturedArtist: e.target.value })
                }
                onKeyDown={(e) =>
                  handleArtistKeyDown(
                    e,
                    "featured",
                    selectedTrack.currentFeaturedArtist || "",
                    (value) => updateTrack(selectedTrack.id, { currentFeaturedArtist: value }),
                    (value) => updateTrack(selectedTrack.id, { featuredArtists: value }),
                    selectedTrack.featuredArtists
                  )
                }
                placeholder="Type artist name and press Enter"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTrack.featuredArtists.map((artist) => (
                  <Badge key={artist} variant="secondary" className="flex items-center gap-1">
                    {artist}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        removeArtist(
                          artist,
                          (value) => updateTrack(selectedTrack.id, { featuredArtists: value }),
                          selectedTrack.featuredArtists
                        )
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Remixers */}
            <div>
              <Label>Remixer(s)</Label>
              <Input
                value={selectedTrack.currentRemixer || ""}
                onChange={(e) =>
                  updateTrack(selectedTrack.id, { currentRemixer: e.target.value })
                }
                onKeyDown={(e) =>
                  handleArtistKeyDown(
                    e,
                    "remixers",
                    selectedTrack.currentRemixer || "",
                    (value) => updateTrack(selectedTrack.id, { currentRemixer: value }),
                    (value) => updateTrack(selectedTrack.id, { remixers: value }),
                    selectedTrack.remixers
                  )
                }
                placeholder="Type remixer name and press Enter"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTrack.remixers.map((artist) => (
                  <Badge key={artist} variant="secondary" className="flex items-center gap-1">
                    {artist}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        removeArtist(
                          artist,
                          (value) => updateTrack(selectedTrack.id, { remixers: value }),
                          selectedTrack.remixers
                        )
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Songwriters */}
            <div>
              <Label>Songwriter(s) (required)</Label>
              <Input
                value={selectedTrack.currentSongwriter || ""}
                onChange={(e) =>
                  updateTrack(selectedTrack.id, { currentSongwriter: e.target.value })
                }
                onKeyDown={(e) =>
                  handleArtistKeyDown(
                    e,
                    "songwriters",
                    selectedTrack.currentSongwriter || "",
                    (value) => updateTrack(selectedTrack.id, { currentSongwriter: value }),
                    (value) => updateTrack(selectedTrack.id, { songwriters: value }),
                    selectedTrack.songwriters
                  )
                }
                placeholder="Type songwriter name and press Enter"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTrack.songwriters.map((artist) => (
                  <Badge key={artist} variant="secondary" className="flex items-center gap-1">
                    {artist}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        removeArtist(
                          artist,
                          (value) => updateTrack(selectedTrack.id, { songwriters: value }),
                          selectedTrack.songwriters
                        )
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Producers */}
            <div>
              <Label>Producer(s)</Label>
              <Input
                value={selectedTrack.currentProducer || ""}
                onChange={(e) =>
                  updateTrack(selectedTrack.id, { currentProducer: e.target.value })
                }
                onKeyDown={(e) =>
                  handleArtistKeyDown(
                    e,
                    "producers",
                    selectedTrack.currentProducer || "",
                    (value) => updateTrack(selectedTrack.id, { currentProducer: value }),
                    (value) => updateTrack(selectedTrack.id, { producers: value }),
                    selectedTrack.producers
                  )
                }
                placeholder="Type producer name and press Enter"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTrack.producers.map((artist) => (
                  <Badge key={artist} variant="secondary" className="flex items-center gap-1">
                    {artist}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        removeArtist(
                          artist,
                          (value) => updateTrack(selectedTrack.id, { producers: value }),
                          selectedTrack.producers
                        )
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Additional Contributors */}
            <div>
              <Label>Additional Contributors</Label>
              <Select
                onValueChange={(role) => {
                  if (!selectedTrack.additionalContributors.find(c => c.role === role)) {
                    updateTrack(selectedTrack.id, {
                      additionalContributors: [
                        ...selectedTrack.additionalContributors,
                        { role, names: [], currentName: '' }
                      ]
                    });
                  }
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Add contributor role" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {CONTRIBUTOR_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTrack.additionalContributors.map((contributor, index) => (
                <div key={contributor.role} className="mt-4">
                  <div className="flex items-center justify-between">
                    <Label>{contributor.role}</Label>
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => {
                        const newContributors = [...selectedTrack.additionalContributors];
                        newContributors.splice(index, 1);
                        updateTrack(selectedTrack.id, {
                          additionalContributors: newContributors
                        });
                      }}
                    />
                  </div>
                  <Input
                    value={contributor.currentName || ""}
                    onChange={(e) => {
                      const newContributors = [...selectedTrack.additionalContributors];
                      newContributors[index] = {
                        ...contributor,
                        currentName: e.target.value
                      };
                      updateTrack(selectedTrack.id, {
                        additionalContributors: newContributors
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && contributor.currentName?.trim()) {
                        const newContributors = [...selectedTrack.additionalContributors];
                        newContributors[index] = {
                          ...contributor,
                          names: [...contributor.names, contributor.currentName.trim()],
                          currentName: ""
                        };
                        updateTrack(selectedTrack.id, {
                          additionalContributors: newContributors
                        });
                      }
                    }}
                    placeholder={`Type ${contributor.role.toLowerCase()} name and press Enter`}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contributor.names.map((name) => (
                      <Badge key={name} variant="secondary">
                        {name}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => {
                            const newContributors = [...selectedTrack.additionalContributors];
                            newContributors[index] = {
                              ...contributor,
                              names: contributor.names.filter(n => n !== name)
                            };
                            updateTrack(selectedTrack.id, {
                              additionalContributors: newContributors
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Rights Section */}
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

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => navigateTrack("prev")}
              disabled={selectedTrackIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit Previous Track
            </Button>
            <Button onClick={onNext}>
              Save and Continue
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
