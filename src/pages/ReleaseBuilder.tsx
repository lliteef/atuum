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
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

type Section = "basic-info" | "artwork" | "tracks" | "scheduling" | "territories" | "publishing" | "overview";
type ReleaseStatus = "In Progress" | "Ready" | "Moderation" | "Sent to Stores";

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
  tracks: {
    title: string;
    version?: string;
    isrc?: string;
    explicitContent: "None" | "Explicit" | "Clean";
    lyrics?: string;
    primaryArtists: string[];
    featuredArtists: string[];
    remixers: string[];
    songwriters: string[];
    producers: string[];
    pLine: string;
  }[];
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

export default function ReleaseBuilder() {
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("basic-info");
  const [releaseStatus, setReleaseStatus] = useState<ReleaseStatus>("In Progress");
  const { toast } = useToast();
  
  const [releaseData, setReleaseData] = useState<ReleaseData>({
    releaseName: location.state?.releaseName || "New Release",
    upc: location.state?.upc,
    catalogNumber: location.state?.releaseNo || "",
    format: location.state?.format || "Single",
    primaryArtists: [],
    featuredArtists: [],
    tracks: [],
    selectedTerritories: [],
    selectedServices: [],
  });

  const validateRelease = () => {
    const errors: string[] = [];

    if (!releaseData.releaseName) errors.push("Release name is required");
    if (!releaseData.metadataLanguage) errors.push("Metadata language is required");
    if (releaseData.primaryArtists.length === 0) errors.push("At least one primary artist is required");
    if (!releaseData.genre) errors.push("Genre is required");
    if (!releaseData.artworkUrl) errors.push("Artwork is required");
    if (releaseData.tracks.length === 0) errors.push("At least one track is required");
    if (!releaseData.releaseDate) errors.push("Release date is required");
    if (releaseData.selectedTerritories.length === 0) errors.push("At least one territory must be selected");
    if (releaseData.selectedServices.length === 0) errors.push("At least one service must be selected");
    if (!releaseData.publishingType) errors.push("Publishing type must be selected");

    return errors;
  };

  const handleSectionChange = (section: Section) => {
    setCurrentSection(section);
    if (section === "overview") {
      const errors = validateRelease();
      if (errors.length === 0) {
        setReleaseStatus("Ready");
      }
    }
  };

  const updateReleaseData = (updates: Partial<ReleaseData>) => {
    setReleaseData(prev => ({ ...prev, ...updates }));
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
              initialData={releaseData}
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
              initialData={releaseData}
              onTerritoriesUpdate={(territories, services) => 
                updateReleaseData({ 
                  selectedTerritories: territories,
                  selectedServices: services 
                })
              }
              onNext={() => handleSectionChange("publishing")}
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