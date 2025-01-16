import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  isExplicit: boolean;
}

interface TracksProps {
  onNext?: () => void;
}

export function Tracks({ onNext }: TracksProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [newTrack, setNewTrack] = useState({
    title: "",
    artist: "",
    duration: "",
  });
  const { toast } = useToast();

  const addTrack = () => {
    if (!newTrack.title || !newTrack.artist || !newTrack.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all track details",
        variant: "destructive",
      });
      return;
    }

    const track: Track = {
      id: crypto.randomUUID(),
      ...newTrack,
      isExplicit: false,
    };

    setTracks([...tracks, track]);
    setNewTrack({ title: "", artist: "", duration: "" });
    
    toast({
      title: "Track Added",
      description: "The track has been added to your release",
    });
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter((track) => track.id !== id));
    toast({
      title: "Track Removed",
      description: "The track has been removed from your release",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Tracks</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="title">Track Title</Label>
          <Input
            id="title"
            value={newTrack.title}
            onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
            placeholder="Enter track title"
          />
        </div>
        <div>
          <Label htmlFor="artist">Artist</Label>
          <Input
            id="artist"
            value={newTrack.artist}
            onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
            placeholder="Enter artist name"
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={newTrack.duration}
            onChange={(e) => setNewTrack({ ...newTrack, duration: e.target.value })}
            placeholder="00:00"
          />
        </div>
      </div>

      <Button onClick={addTrack} className="w-full">
        <Plus className="mr-2" /> Add Track
      </Button>

      {tracks.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track) => (
              <TableRow key={track.id}>
                <TableCell>{track.title}</TableCell>
                <TableCell>{track.artist}</TableCell>
                <TableCell>{track.duration}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeTrack(track.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Button 
        className="w-full"
        onClick={onNext}
        disabled={tracks.length === 0}
      >
        Save and Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}