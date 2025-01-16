import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

// Language options - this could be moved to a separate constants file
const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
];

const genres = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Electronic",
  "Classical",
  "Jazz",
  "Country",
  "Folk",
  "Latin",
];

const subgenres = [
  "Alternative Rock",
  "Indie Pop",
  "Trap",
  "Soul",
  "House",
  "Techno",
  "Chamber Music",
  "Bebop",
  "Bluegrass",
  "Traditional",
];

const formats = ["Single", "EP", "Album/Full Length"];

interface BasicInfoProps {
  initialData: {
    releaseName: string;
    upc?: string;
    catalogNumber: string;
    format: string;
  };
  onUpdateReleaseName: (name: string) => void;
  onNext: () => void;
}

export function BasicInfo({ initialData, onUpdateReleaseName, onNext }: BasicInfoProps) {
  const [primaryArtists, setPrimaryArtists] = useState<string[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<string[]>([]);
  const [currentPrimaryArtist, setCurrentPrimaryArtist] = useState("");
  const [currentFeaturedArtist, setCurrentFeaturedArtist] = useState("");
  const [deliverFeaturedAsPrimary, setDeliverFeaturedAsPrimary] = useState(false);
  const [labels, setLabels] = useState<string[]>(["Amber Records"]);
  const [newLabel, setNewLabel] = useState("");

  const handlePrimaryArtistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentPrimaryArtist.trim()) {
      setPrimaryArtists([...primaryArtists, currentPrimaryArtist.trim()]);
      setCurrentPrimaryArtist("");
    }
  };

  const handleFeaturedArtistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentFeaturedArtist.trim()) {
      setFeaturedArtists([...featuredArtists, currentFeaturedArtist.trim()]);
      setCurrentFeaturedArtist("");
    }
  };

  const removePrimaryArtist = (artist: string) => {
    setPrimaryArtists(primaryArtists.filter((a) => a !== artist));
  };

  const removeFeaturedArtist = (artist: string) => {
    setFeaturedArtists(featuredArtists.filter((a) => a !== artist));
  };

  const addNewLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Basic Info</h2>

      <div className="space-y-4">
        <div>
          <Label>UPC</Label>
          <Input value={initialData.upc || "UPC will be assigned"} disabled />
        </div>

        <div>
          <Label>Metadata Language</Label>
          <Select required>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Release Name</Label>
          <Input
            value={initialData.releaseName}
            onChange={(e) => onUpdateReleaseName(e.target.value)}
          />
        </div>

        <div>
          <Label>Catalog Number</Label>
          <Input value={initialData.catalogNumber} disabled />
        </div>

        <Separator className="my-6" />
        <h3 className="text-lg font-semibold">Artists</h3>

        <div>
          <Label>Primary Artist(s)</Label>
          <Input
            value={currentPrimaryArtist}
            onChange={(e) => setCurrentPrimaryArtist(e.target.value)}
            onKeyDown={handlePrimaryArtistKeyDown}
            placeholder="Type artist name and press Enter"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {primaryArtists.map((artist) => (
              <Badge key={artist} variant="secondary">
                {artist}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => removePrimaryArtist(artist)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Featured Artist(s)</Label>
          <Input
            value={currentFeaturedArtist}
            onChange={(e) => setCurrentFeaturedArtist(e.target.value)}
            onKeyDown={handleFeaturedArtistKeyDown}
            placeholder="Type artist name and press Enter"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {featuredArtists.map((artist) => (
              <Badge key={artist} variant="secondary">
                {artist}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => removeFeaturedArtist(artist)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={deliverFeaturedAsPrimary}
              onCheckedChange={setDeliverFeaturedAsPrimary}
            />
            <Label>
              Deliver Featured Artist(s) as Primary Artists in Spotify, Deezer and
              Tidal
            </Label>
          </div>
        </div>

        <Separator className="my-6" />
        <h3 className="text-lg font-semibold">Release Details</h3>

        <div>
          <Label>Genre</Label>
          <Select required>
            <SelectTrigger>
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre.toLowerCase()}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Subgenre</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select subgenre" />
            </SelectTrigger>
            <SelectContent>
              {subgenres.map((subgenre) => (
                <SelectItem key={subgenre} value={subgenre.toLowerCase()}>
                  {subgenre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Format</Label>
          <Select defaultValue={initialData.format.toLowerCase()}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format} value={format.toLowerCase()}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Label Name / Imprint</Label>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select label" />
              </SelectTrigger>
              <SelectContent>
                {labels.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Add new label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-48"
            />
            <Button onClick={addNewLabel}>Add</Button>
          </div>
        </div>

        <div>
          <Label>© Line</Label>
          <Input placeholder="2025 Amber Records" />
        </div>

        <Button 
          className="w-full" 
          onClick={onNext}
        >
          Save and Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
