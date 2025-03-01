<lov-code>
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X, Upload, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type Track } from "@/types/track";

type ReleaseStatus = Database["public"]["Enums"]["release_status"];

export interface ReleaseData {
  id?: string;
  release_name: string;
  upc?: string;
  catalog_number?: string;
  format?: string;
  metadata_language?: string;
  primary_artists?: string[];
  featured_artists?: string[];
  genre?: string;
  subgenre?: string;
  label?: string;
  copyright_line?: string;
  artwork_url?: string;
  release_date?: string;
  sales_start_date?: string;
  presave_option?: string;
  presave_date?: string;
  pricing?: string;
  selected_territories?: string[];
  selected_services?: string[];
  publishing_type?: string;
  publisher_name?: string;
  status?: ReleaseStatus;
  tracks?: Track[];
}

const sections = [
  { id: "basic-info", label: "Basic Info" },
  { id: "artwork", label: "Artwork" },
  { id: "tracks", label: "Tracks" },
  { id: "scheduling", label: "Scheduling" },
  { id: "territories", label: "Territories" },
  { id: "publishing", label: "Publishing" }
];

// Language options
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
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", 
  "Classical", "Jazz", "Country", "Folk", "Latin"
];

const subgenres = [
  "Alternative Rock", "Indie Pop", "Trap", "Soul", "House",
  "Techno", "Chamber Music", "Bebop", "Bluegrass", "Traditional"
];

const formats = ["Single", "EP", "Album/Full Length", "Music Video"];

const territories = [
  "Worldwide", "United States", "Europe", "Asia", 
  "Latin America", "Africa", "Australia", "Canada", 
  "United Kingdom", "Japan", "South Korea", "Brazil"
];

const services = [
  "Spotify", "Apple Music", "YouTube Music", "Amazon Music", 
  "Deezer", "Tidal", "Pandora", "SoundCloud", "TikTok", 
  "Instagram/Facebook", "Beatport", "Bandcamp"
];

export default function ReleaseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("basic-info");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Form state
  const [releaseData, setReleaseData] = useState<ReleaseData>({
    release_name: "",
    format: "single",
    metadata_language: "en",
    primary_artists: [],
    featured_artists: [],
    selected_territories: ["Worldwide"],
    selected_services: [],
    tracks: [],
  });
  
  // UI state
  const [currentPrimaryArtist, setCurrentPrimaryArtist] = useState("");
  const [currentFeaturedArtist, setCurrentFeaturedArtist] = useState("");
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert database track format to our Track type
  const convertDbTrackToTrack = (dbTrack: any): Track => {
    return {
      id: dbTrack.id,
      title: dbTrack.title,
      version: dbTrack.version,
      isrc: dbTrack.isrc,
      autoAssignIsrc: true, // Default since it might not be in DB
      lyricsLanguage: dbTrack.lyrics_language || releaseData.metadata_language || "en",
      explicitContent: dbTrack.explicit_content as "None" | "Explicit" | "Clean" || "None",
      lyrics: dbTrack.lyrics,
      primaryArtists: dbTrack.primary_artists || [],
      featuredArtists: dbTrack.featured_artists || [],
      remixers: dbTrack.remixers || [],
      songwriters: dbTrack.songwriters || [],
      producers: dbTrack.producers || [],
      additionalContributors: dbTrack.additional_contributors || [],
      pLine: dbTrack.p_line || "",
      audioUrl: dbTrack.audio_url,
      audioFilename: dbTrack.audio_filename,
      created_at: dbTrack.created_at,
      created_by: dbTrack.created_by,
      release_id: dbTrack.release_id
    };
  };

  // Fetch release data if editing
  const { isLoading, error } = useQuery({
    queryKey: ['release', id],
    queryFn: async () => {
      if (!id) throw new Error('No release ID provided');
      
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: "Failed to load release data",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        toast({
          title: "Error",
          description: "Release not found",
          variant: "destructive",
        });
        throw new Error('Release not found');
      }

      setReleaseData(data);
      return data;
    },
    enabled: !!id,
  });

  // Also fetch tracks for this release
  useQuery({
    queryKey: ['release-tracks', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('release_id', id);

      if (error) {
        console.error('Error loading tracks:', error);
        return [];
      }

      if (data && data.length > 0) {
        // Convert database tracks to our Track type
        const convertedTracks = data.map(convertDbTrackToTrack);
        setReleaseData(prev => ({ ...prev, tracks: convertedTracks }));
      }
      
      return data;
    },
    enabled: !!id,
  });

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Form change handlers
  const updateReleaseData = (data: Partial<ReleaseData>) => {
    setReleaseData(prev => ({ ...prev, ...data }));
  };

  const handleAddPrimaryArtist = () => {
    if (currentPrimaryArtist.trim()) {
      const primaryArtists = [...(releaseData.primary_artists || []), currentPrimaryArtist.trim()];
      updateReleaseData({ primary_artists: primaryArtists });
      setCurrentPrimaryArtist("");
    }
  };

  const handleAddFeaturedArtist = () => {
    if (currentFeaturedArtist.trim()) {
      const featuredArtists = [...(releaseData.featured_artists || []), currentFeaturedArtist.trim()];
      updateReleaseData({ featured_artists: featuredArtists });
      setCurrentFeaturedArtist("");
    }
  };

  const removePrimaryArtist = (artist: string) => {
    updateReleaseData({
      primary_artists: releaseData.primary_artists?.filter(a => a !== artist)
    });
  };

  const removeFeaturedArtist = (artist: string) => {
    updateReleaseData({
      featured_artists: releaseData.featured_artists?.filter(a => a !== artist)
    });
  };

  const toggleTrackExpansion = (trackId: string) => {
    setExpandedTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  const addNewTrack = () => {
    const newTrack: Track = {
      id: `temp-${Date.now()}`,
      title: "",
      autoAssignIsrc: true,
      lyricsLanguage: releaseData.metadata_language || "en",
      explicitContent: "None",
      primaryArtists: releaseData.primary_artists || [],
      featuredArtists: [],
      remixers: [],
      songwriters: [],
      producers: [],
      additionalContributors: [],
      pLine: "",
    };
    
    updateReleaseData({
      tracks: [...(releaseData.tracks || []), newTrack]
    });
    
    // Auto-expand the new track
    setExpandedTracks(prev => ({
      ...prev,
      [newTrack.id]: true
    }));
  };

  const updateTrack = (trackId: string, updatedData: Partial<Track>) => {
    updateReleaseData({
      tracks: releaseData.tracks?.map(track => 
        track.id === trackId ? { ...track, ...updatedData } : track
      )
    });
  };

  const removeTrack = (trackId: string) => {
    updateReleaseData({
      tracks: releaseData.tracks?.filter(track => track.id !== trackId)
    });
  };

  // Save release
  const saveRelease = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!releaseData.release_name) {
        toast({
          title: "Missing information",
          description: "Please enter a release name",
          variant: "destructive",
        });
        scrollToSection("basic-info");
        setIsSubmitting(false);
        return;
      }
      
      if (!releaseData.primary_artists?.length) {
        toast({
          title: "Missing information",
          description: "Please add at least one primary artist",
          variant: "destructive",
        });
        scrollToSection("basic-info");
        setIsSubmitting(false);
        return;
      }
      
      if (!releaseData.tracks?.length) {
        toast({
          title: "Missing information",
          description: "Please add at least one track",
          variant: "destructive",
        });
        scrollToSection("tracks");
        setIsSubmitting(false);
        return;
      }

      // Create or update release in database
      let releaseId = id;
      
      if (!releaseId) {
        // Create new release
        const { data, error } = await supabase
          .from('releases')
          .insert(releaseData)
          .select('id')
          .single();
          
        if (error) throw error;
        releaseId = data.id;
      } else {
        // Update existing release
        const { error } = await supabase
          .from('releases')
          .update(releaseData)
          .eq('id', releaseId);
          
        if (error) throw error;
      }
      
      // Handle tracks
      if (releaseData.tracks?.length) {
        // Process each track
        for (const track of releaseData.tracks) {
          const isNewTrack = track.id.startsWith('temp-');
          
          // Convert Track to database format
          const dbTrack = {
            title: track.title,
            version: track.version,
            isrc: track.isrc,
            lyrics: track.lyrics,
            lyrics_language: track.lyricsLanguage,
            explicit_content: track.explicitContent,
            primary_artists: track.primaryArtists,
            featured_artists: track.featuredArtists,
            remixers: track.remixers,
            songwriters: track.songwriters,
            producers: track.producers,
            additional_contributors: track.additionalContributors,
            p_line: track.pLine,
            audio_url: track.audioUrl,
            audio_filename: track.audioFilename,
            release_id: releaseId
          };
          
          if (isNewTrack) {
            // Create new track
            await supabase
              .from('tracks')
              .insert(dbTrack);
          } else {
            // Update existing track
            await supabase
              .from('tracks')
              .update(dbTrack)
              .eq('id', track.id);
          }
        }
      }

      toast({
        title: "Success",
        description: "Release saved successfully",
      });
      
      // Redirect to the releases page
      navigate('/workstation');
    } catch (error) {
      console.error("Error saving release:", error);
      toast({
        title: "Error",
        description: "Failed to save release",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2C]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1F2C]">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Error Loading Release</h2>
          <p className="text-[#8E9196]">{(error as Error).message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/workstation')}
          >
            Back to Workstation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#1A1F2C] text-white">
      {/* Navigation Sidebar */}
      <aside className="w-64 border-r border-[#333] flex flex-col bg-[#121620]">
        <div className="p-6 border-b border-[#333]">
          <h1 className="text-xl font-semibold">{releaseData.release_name || "New Release"}</h1>
          <p className="text-sm text-[#8E9196] mt-1">{releaseData.upc || "UPC will be assigned"}</p>
          <div className="flex items-center mt-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
            <span>In Progress</span>
          </div>
        </div>
        <nav className="p-3 flex-1">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeSection === section.id
                      ? "bg-[#2DD4BF] text-[#0F172A] font-medium"
                      : "hover:bg-[#333] text-[#E5E7EB]"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-[#333]">
          <Button
            className="w-full bg-[#2DD4BF] hover:bg-[#22A89A] text-[#0F172A]"
            onClick={saveRelease}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Release"}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-16 pb-20">
          {/* Basic Info Section */}
          <section 
            id="basic-info" 
            ref={(el) => (sectionRefs.current["basic-info"] = el)}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold border-b border-[#333] pb-2">Basic Info</h2>
            
            {/* Release Name */}
            <div>
              <Label htmlFor="release-name">Release Name</Label>
              <Input
                id="release-name"
                value={releaseData.release_name}
                onChange={(e) => updateReleaseData({ release_name: e.target.value })}
                placeholder="Enter release name"
                className="bg-[#222] border-[#333]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* UPC */}
              <div>
                <Label htmlFor="upc">UPC</Label>
                <Input
                  id="upc"
                  value={releaseData.upc || ""}
                  disabled
                  placeholder="Will be assigned automatically"
                  className="bg-[#222] border-[#333]"
                />
              </div>
              
              {/* Catalog Number */}
              <div>
                <Label htmlFor="catalog-number">Catalog Number</Label>
                <Input
                  id="catalog-number"
                  value={releaseData.catalog_number || ""}
                  onChange={(e) => updateReleaseData({ catalog_number: e.target.value })}
                  placeholder="Enter catalog number"
                  className="bg-[#222] border-[#333]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Format */}
              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={releaseData.format?.toLowerCase() || "single"}
                  onValueChange={(value) => updateReleaseData({ format: value })}
                >
                  <SelectTrigger className="bg-[#222] border-[#333]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#333]">
                    {formats.map((format) => (
                      <SelectItem key={format} value={format.toLowerCase()}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Metadata Language */}
              <div>
                <Label htmlFor="metadata-language">Metadata Language</Label>
                <Select
                  value={releaseData.metadata_language || "en"}
                  onValueChange={(value) => updateReleaseData({ metadata_language: value })}
                >
                  <SelectTrigger className="bg-[#222] border-[#333]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#333]">
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Primary Artists */}
            <div>
              <Label htmlFor="primary-artists">Primary Artist(s)</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-artists"
                  value={currentPrimaryArtist}
                  onChange={(e) => setCurrentPrimaryArtist(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPrimaryArtist()}
                  placeholder="Type artist name and press Enter"
                  className="bg-[#222] border-[#333]"
                />
                <Button 
                  onClick={handleAddPrimaryArtist}
                  className="bg-[#2DD4BF] hover:bg-[#22A89A] text-[#0F172A]"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {releaseData.primary_artists?.map((artist) => (
                  <Badge key={artist} variant="secondary" className="bg-[#333] text-white">
                    {artist}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => removePrimaryArtist(artist)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Featured Artists */}
            <div>
              <Label htmlFor="featured-artists">Featured Artist(s)</Label>
              <div className="flex gap-2">
                <Input
                  id="featured-artists"
                  value={currentFeaturedArtist}
                  onChange={(e) => setCurrentFeaturedArtist(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddFeaturedArtist()}
                  placeholder="Type artist name and press Enter"
                  className="bg-[#222] border-[#333]"
                />
                <Button 
                  onClick={handleAddFeaturedArtist}
                  className="bg-[#2DD4BF] hover:bg-[#22A89A] text-[#0F172A]"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {releaseData.featured_artists?.map((artist) => (
                  <Badge key={artist} variant="secondary" className="bg-[#333] text-white">
                    {artist}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => removeFeaturedArtist(artist)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Genre */}
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={releaseData.genre || ""}
                  onValueChange={(value) => updateReleaseData({ genre: value })}
                >
                  <SelectTrigger className="bg-[#222] border-[#333]">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#333]">
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre.toLowerCase()}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Subgenre */}
              <div>
                <Label htmlFor="subgenre">Subgenre</Label>
                <Select
                  value={releaseData.subgenre || ""}
                  onValueChange={(value) => updateReleaseData({ subgenre: value })}
                >
                  <SelectTrigger className="bg-[#222] border-[#333]">
                    <SelectValue placeholder="Select subgenre" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#333]">
                    {subgenres.map((subgenre) => (
                      <SelectItem key={subgenre} value={subgenre.toLowerCase()}>
                        {subgenre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Label */}
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={releaseData.label || ""}
                  onChange={(e) => updateReleaseData({ label: e.target.value })}
                  placeholder="Enter label name"
                  className="bg-[#222] border-[#333]"
                />
              </div>
              
              {/* Copyright Line */}
              <div>
                <Label htmlFor="copyright">© Line</Label>
                <Input
                  id="copyright"
                  value={releaseData.copyright_line || ""}
                  onChange={(e) => updateReleaseData({ copyright_line: e.target.value })}
                  placeholder="2025 Your Label"
                  className="bg-[#222] border-[#333]"
                />
              </div>
            </div>
          </section>

          {/* Artwork Section */}
          <section 
            id="artwork" 
            ref={(el) => (sectionRefs.current["artwork"] = el)}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold border-b border-[#333] pb-2">Artwork</h2>
            
            <div className="bg-[#222] border border-[#333] rounded-lg p-8 text-center">
              {releaseData.artwork_url ? (
                <div className="space-y-4">
                  <div className="relative w-64 h-64 mx-auto">
                    <img 
                      src={releaseData.artwork_url} 
                      alt="Release artwork" 
                      className="w-full h-full object-cover rounded-md" 
                    />
                    <button 
                      className="absolute top-2 right-2 bg-black/70 p-1 rounded-full"
                      onClick={() => updateReleaseData({ artwork_url: undefined })}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-64 h-64 mx-auto border-2 border-dashed border-[#444] rounded-md flex items-center justify-center bg-[#1A1F2C]">
                    <Upload size={48} className="text-[#444]" />
                  </div>
                  <p className="text-[#8E9196]">
                    Drag and drop or click to upload artwork image (3000x3000px)
                  </p>
                  <Button className="bg-[#333] hover:bg-[#444]">
                    Upload Artwork
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Tracks Section */}
          <section 
            id="tracks" 
            ref={(el) => (sectionRefs.current["tracks"] = el)}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold border-b border-[#333] pb-2">Tracks</h2>
            
            <div className="space-y-4">
              {releaseData.tracks && releaseData.tracks.length > 0 ? (
                releaseData.tracks.map((track, index) => (
                  <Card key={track.id} className="bg-[#222] border-[#333]">
                    <CardContent className="p-0">
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer"
                        onClick={() => toggleTrackExpansion(track.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-[#4F46E5] flex items-center justify-center text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium">{track.title || "Untitled Track"}</span>
                        </div>
                        <div className="flex items-center">
                          <button 
                            className="mr-2 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTrack(track.id);
                            }}
                          >
                            <X size={18} />
                          </button>
                          {expandedTracks[track.id] ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </div>
                      </div>
                      
                      {expandedTracks[track.id] && (
                        <div className="border-t border-[#333] p-4">
                          <div className="space-y-4">
                            {/* Track Title and Version */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`track-title-${track.id}`}>Track Title</Label>
                                <Input
                                  id={`track-title-${track.id}`}
                                  value={track.title}
                                  onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                                  placeholder="Enter track title"
                                  className="bg-[#1A1F2C] border-[#333]"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`track-version-${track.id}`}>Version</Label>
                                <Input
                                  id={`track-version-${track.id}`}
                                  value={track.version || ""}
                                  onChange={(e) => updateTrack(track.id, { version: e.target.value })}
                                  placeholder="Original Mix, Radio Edit, etc."
                                  className="bg-[#1A1F2C] border-[#333]"
                                />
                              </div>
                            </div>
                            
                            {/* ISRC and Auto-assign */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`track-isrc-${track.id}`}>ISRC</Label>
                                <Input
                                  id={`track-isrc-${track.id}`}
                                  value={track.isrc || ""}
                                  onChange={(e) => updateTrack(track.id, { isrc: e.target.value })}
                                  placeholder="Enter ISRC code"
                                  disabled={track.autoAssignIsrc}
                                  className="bg-[#1A1F2C] border-[#333]"
                                />
                              </div>
                              <div className="flex items-center h-full pt-6">
                                <Switch
                                  id={`auto-isrc-${track.id}`}
                                  checked={track.autoAssignIsrc}
                                  onCheckedChange={(checked) => 
                                    updateTrack(track.id, { autoAssignIsrc: checked })
                                  }
                                />
                                <Label 
                                  htmlFor={`auto-isrc-${track.id}`}
                                  className="ml-2"
                                >
                                  Auto-assign ISRC
                                </Label>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Language */}
                              <div>
                                <Label htmlFor={`track-language-${track.id}`}>Language</Label>
                                <Select
                                  value={track.lyricsLanguage || "en"}
                                  onValueChange={(value) => 
                                    updateTrack(track.id, { lyricsLanguage: value })
                                  }
                                >
                                  <SelectTrigger 
                                    id={`track-language-${track.id}`}
                                    className="bg-[#1A1F2C] border-[#333]"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#222] border-[#333]">
                                    {languages.map((lang) => (
                                      <SelectItem key={lang.value} value={lang.value}>
                                        {lang.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Explicit Content */}
                              <div>
                                <Label htmlFor={`track-explicit-${track.id}`}>Explicit Content</Label>
                                <Select
                                  value={track.explicitContent}
                                  onValueChange={(value) => 
                                    updateTrack(track.id, { 
                                      explicitContent: value as "None" | "Explicit" | "Clean" 
                                    })
                                  }
                                >
                                  <SelectTrigger 
                                    id={`track-explicit-${track.id}`}
                                    className="bg-[#1A1F2C] border-[#333]"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#222] border-[#333]">
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="Explicit">Explicit</SelectItem>
                                    <SelectItem value="Clean">Clean (Edited)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            {/* Lyrics */}
                            <div>
                              <Label htmlFor={`track-lyrics-${track.id}`}>Lyrics</Label>
                              <Textarea
                                id={`track-lyrics-${track.id}`}
                                value={track.lyrics || ""}
                                onChange={(e) => updateTrack(track.id, { lyrics: e.target.value })}
                                placeholder="Enter track lyrics"
                                className="bg-[#1A1F2C] border-[#333] min-h-[100px]"
                              />
                            </div>
                            
                            {/* Audio File */}
                            <div className="bg-[#1A1F2C] border border-[#333] rounded-lg p
