import { useLocation } from "react-router-dom";
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

  const handleSubmitRelease = () => {
    const errors = validateRelease();
    if (errors.length > 0) {
      toast({
        title: "Cannot submit release",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      });
      return;
    }

    // Handle release submission
    console.log("Submitting release...", releaseData);
    toast({
      title: "Release submitted",
      description: "Your release has been submitted successfully",
    });
    
    // Clear session storage after successful submission
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('currentSection');
    sessionStorage.removeItem('basicInfoData');
    sessionStorage.removeItem('territoriesAndServicesData');
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