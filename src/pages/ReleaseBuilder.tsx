import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReleaseBuilderSidebar } from "@/components/ReleaseBuilderSidebar";
import { BasicInfo } from "@/components/release-builder/BasicInfo";
import { Artwork } from "@/components/release-builder/Artwork";
import { Tracks } from "@/components/release-builder/Tracks";
import { Scheduling } from "@/components/release-builder/Scheduling";
import { TerritoriesAndServices } from "@/components/release-builder/TerritoriesAndServices";
import { Publishing } from "@/components/release-builder/Publishing";
import { Overview } from "@/components/release-builder/Overview";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type ReleaseSection = "basic-info" | "artwork" | "tracks" | "scheduling" | "territories" | "publishing" | "overview";
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
  tracks?: any[];
}

export default function ReleaseBuilder() {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<ReleaseSection>("basic-info");
  const [releaseName, setReleaseName] = useState<string>("");
  const [territoriesAndServicesData, setTerritoriesAndServicesData] = useState<{
    selectedTerritories: string[];
    selectedServices: string[];
  }>({ selectedTerritories: [], selectedServices: [] });

  const { data: release, isLoading, error } = useQuery({
    queryKey: ['release', id],
    queryFn: async () => {
      if (!id) throw new Error('No release ID provided');
      
      const { data, error } = await supabase
        .from('releases')
        .select('*')
        .eq('id', id)
        .single();

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

      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (release?.release_name) {
      setReleaseName(release.release_name);
    }
  }, [release?.release_name]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Release</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case "basic-info":
        return (
          <BasicInfo
            initialData={{
              releaseName: release?.release_name || "",
              upc: release?.upc,
              catalogNumber: release?.catalog_number || "",
              format: release?.format || "single",
              metadataLanguage: release?.metadata_language,
              primaryArtists: release?.primary_artists,
              featuredArtists: release?.featured_artists,
              genre: release?.genre,
              subgenre: release?.subgenre,
              label: release?.label,
              copyrightLine: release?.copyright_line,
            }}
            onUpdateReleaseName={setReleaseName}
            onNext={() => setCurrentSection("artwork")}
          />
        );
      case "artwork":
        return <Artwork onNext={() => setCurrentSection("tracks")} />;
      case "tracks":
        return (
          <Tracks
            initialData={{
              tracks: [],
              releaseId: id,
            }}
            onNext={() => setCurrentSection("scheduling")}
          />
        );
      case "scheduling":
        return <Scheduling onNext={() => setCurrentSection("territories")} />;
      case "territories":
        return (
          <TerritoriesAndServices 
            onNext={() => setCurrentSection("publishing")}
            onUpdateData={setTerritoriesAndServicesData}
          />
        );
      case "publishing":
        return <Publishing onNext={() => setCurrentSection("overview")} />;
      case "overview":
        return (
          <Overview
            releaseData={{
              ...release,
              selected_territories: territoriesAndServicesData.selectedTerritories,
              selected_services: territoriesAndServicesData.selectedServices,
            }}
            errors={[]}
            onNext={() => {
              toast({
                title: "Success",
                description: "Release submitted successfully",
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ReleaseBuilderSidebar
        releaseName={releaseName}
        upc={release?.upc}
        status={release?.status || "In Progress"}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      <main className="flex-1 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
}