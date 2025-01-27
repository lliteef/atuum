import { useLocation, useNavigate } from "react-router-dom";
import { ReleaseBuilderSidebar } from "@/components/ReleaseBuilderSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BasicInfo } from "@/components/release-builder/BasicInfo";
import { Artwork } from "@/components/release-builder/Artwork";
import { Tracks } from "@/components/release-builder/Tracks";
import { Scheduling } from "@/components/release-builder/Scheduling";
import { TerritoriesAndServices } from "@/components/release-builder/TerritoriesAndServices";
import { Publishing } from "@/components/release-builder/Publishing";
import { Overview } from "@/components/release-builder/Overview";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Section = "basic-info" | "artwork" | "tracks" | "scheduling" | "territories" | "publishing" | "overview";
type ReleaseStatus = "In Progress" | "Ready" | "Moderation" | "Sent to Stores";

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

export interface ReleaseData {
  releaseName: string;
  upc?: string;
  catalogNumber: string;
  format: string;
  metadataLanguage?: string;
  primaryArtists: string[];
  featuredArtists: string[];
  genre?: string;
  subgenre?: string;
  label?: string;
  copyrightLine?: string;
  artworkUrl?: string;
  tracks: Track[];
  releaseDate?: Date;
  salesStartDate?: Date;
  presaveOption?: string;
  presaveDate?: Date;
  pricing?: string;
  selectedTerritories: string[];
  selectedServices: string[];
  publishingType?: string;
  publisherName?: string;
}

const STORAGE_KEY = 'releaseBuilderData';

export default function ReleaseBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<Section>(() => {
    const savedSection = sessionStorage.getItem('currentSection');
    return (savedSection as Section) || "basic-info";
  });
  const [releaseStatus, setReleaseStatus] = useState<ReleaseStatus>("In Progress");
  const { toast } = useToast();
  
  const [releaseData, setReleaseData] = useState<ReleaseData>(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    const basicInfoData = JSON.parse(sessionStorage.getItem('basicInfoData') || '{}');
    const territoriesData = JSON.parse(sessionStorage.getItem('territoriesAndServicesData') || '{}');
    
    const initialData = {
      releaseName: location.state?.releaseName || "New Release",
      upc: location.state?.upc,
      catalogNumber: location.state?.releaseNo || "",
      format: location.state?.format || "Single",
      primaryArtists: [],
      featuredArtists: [],
      tracks: [],
      selectedTerritories: territoriesData.selectedTerritories || [],
      selectedServices: territoriesData.selectedServices || [],
      ...basicInfoData, // Merge basicInfoData
    };

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return { ...initialData, ...parsedData };
    }

    return initialData;
  });

  useEffect(() => {
    // Update release data whenever basicInfoData changes
    const basicInfoData = JSON.parse(sessionStorage.getItem('basicInfoData') || '{}');
    setReleaseData(prev => ({
      ...prev,
      ...basicInfoData,
    }));
  }, [currentSection]); // Re-run when section changes to ensure we have latest data

  const validateRelease = () => {
    const errors: string[] = [];
    const basicInfoData = JSON.parse(sessionStorage.getItem('basicInfoData') || '{}');

    if (!basicInfoData.metadataLanguage) errors.push("Metadata language is required");
    if (!basicInfoData.primaryArtists?.length) errors.push("At least one primary artist is required");
    if (!basicInfoData.genre) errors.push("Genre is required");
    if (!releaseData.artworkUrl) errors.push("Artwork is required");
    if (!releaseData.tracks?.length) errors.push("At least one track is required");
    if (!releaseData.releaseDate) errors.push("Release date is required");
    if (!releaseData.selectedTerritories?.length) errors.push("At least one territory must be selected");
    if (!releaseData.selectedServices?.length) errors.push("At least one service must be selected");
    if (!releaseData.publishingType) errors.push("Publishing type must be selected");

    return errors;
  };

  const handleSectionChange = (section: Section) => {
    setCurrentSection(section);
    sessionStorage.setItem('currentSection', section);
    
    if (section === "overview") {
      const errors = validateRelease();
      if (errors.length === 0) {
        setReleaseStatus("Ready");
      }
    }
  };

  const updateReleaseData = (updates: Partial<ReleaseData>) => {
    setReleaseData(prev => {
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmitRelease = async () => {
    const errors = validateRelease();
    if (errors.length > 0) {
      toast({
        title: "Cannot submit release",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a release",
          variant: "destructive",
        });
        return;
      }

      // First create the release with snake_case property names
      const { data: release, error } = await supabase
        .from('releases')
        .insert({
          release_name: releaseData.releaseName,
          upc: releaseData.upc,
          catalog_number: releaseData.catalogNumber,
          format: releaseData.format?.toLowerCase(),
          metadata_language: releaseData.metadataLanguage,
          primary_artists: releaseData.primaryArtists,
          featured_artists: releaseData.featuredArtists,
          genre: releaseData.genre?.toLowerCase(),
          subgenre: releaseData.subgenre?.toLowerCase(),
          label: releaseData.label,
          copyright_line: releaseData.copyrightLine,
          artwork_url: releaseData.artworkUrl,
          release_date: releaseData.releaseDate,
          sales_start_date: releaseData.salesStartDate,
          presave_option: releaseData.presaveOption,
          presave_date: releaseData.presaveDate,
          pricing: releaseData.pricing,
          selected_territories: releaseData.selectedTerritories,
          selected_services: releaseData.selectedServices,
          publishing_type: releaseData.publishingType,
          publisher_name: releaseData.publisherName,
          status: 'Moderation',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Then update all tracks with the release_id and snake_case property names
      if (release && releaseData.tracks.length > 0) {
        const { error: tracksError } = await supabase
          .from('tracks')
          .insert(
            releaseData.tracks.map(track => ({
              title: track.title,
              version: track.version,
              isrc: track.isrc,
              lyrics_language: track.lyricsLanguage,
              explicit_content: track.explicitContent,
              lyrics: track.lyrics,
              primary_artists: track.primaryArtists,
              featured_artists: track.featuredArtists,
              remixers: track.remixers,
              songwriters: track.songwriters,
              producers: track.producers,
              additional_contributors: track.additionalContributors,
              p_line: track.pLine,
              audio_url: track.audioUrl,
              audio_filename: track.audioFilename,
              release_id: release.id,
              created_by: user.id
            }))
          );

        if (tracksError) throw tracksError;
      }

      toast({
        title: "Release submitted",
        description: "Your release has been submitted successfully",
      });
      
      // Clear session storage after successful submission
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('currentSection');
      sessionStorage.removeItem('basicInfoData');
      sessionStorage.removeItem('territoriesAndServicesData');

      // Navigate back to the workstation
      navigate('/');
    } catch (error) {
      console.error('Error submitting release:', error);
      toast({
        title: "Error",
        description: "Failed to submit release. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0F172A] text-white">
        <ReleaseBuilderSidebar
          releaseName={releaseData.releaseName}
          upc={releaseData.upc}
          status={releaseStatus}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />
        <main className="flex-1 overflow-auto">
          {currentSection === "basic-info" && (
            <BasicInfo
              initialData={releaseData}
              onUpdateReleaseName={(name) => updateReleaseData({ releaseName: name })}
              onNext={() => handleSectionChange("artwork")}
            />
          )}
          {currentSection === "artwork" && (
            <Artwork 
              initialData={releaseData}
              onArtworkUpdate={(url) => updateReleaseData({ artworkUrl: url })}
              onNext={() => handleSectionChange("tracks")}
            />
          )}
          {currentSection === "tracks" && (
            <Tracks 
              initialData={{ tracks: releaseData.tracks }}
              onTracksUpdate={(tracks) => updateReleaseData({ tracks })}
              onNext={() => handleSectionChange("scheduling")}
            />
          )}
          {currentSection === "scheduling" && (
            <Scheduling 
              initialData={releaseData}
              onSchedulingUpdate={(data) => updateReleaseData(data)}
              onNext={() => handleSectionChange("territories")}
            />
          )}
          {currentSection === "territories" && (
            <TerritoriesAndServices
              onNext={() => handleSectionChange("publishing")}
              onUpdateData={(data) => updateReleaseData(data)}
            />
          )}
          {currentSection === "publishing" && (
            <Publishing
              initialData={releaseData}
              onPublishingUpdate={(data) => updateReleaseData(data)}
              onNext={() => handleSectionChange("overview")}
            />
          )}
          {currentSection === "overview" && (
            <Overview
              releaseData={releaseData}
              errors={validateRelease()}
              onNext={handleSubmitRelease}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
