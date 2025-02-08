
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReleaseBuilderSidebar } from "@/components/ReleaseBuilderSidebar";
import { BasicInfo } from "@/components/release-builder/BasicInfo";
import { Artwork } from "@/components/release-builder/Artwork";
import { VideoUpload } from "@/components/release-builder/VideoUpload";
import { Scheduling } from "@/components/release-builder/Scheduling";
import { TerritoriesAndServices } from "@/components/release-builder/TerritoriesAndServices";
import { MusicVideoOverview } from "@/components/release-builder/MusicVideoOverview";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { SidebarProvider } from "@/components/ui/sidebar";

type ReleaseSection = "basic-info" | "thumbnail" | "video" | "scheduling" | "territories" | "overview";
type ReleaseStatus = Database["public"]["Enums"]["release_status"];

export interface MusicVideoReleaseData {
  id?: string;
  release_name: string;
  upc?: string;
  catalog_number?: string;
  metadata_language?: string;
  primary_artists?: string[];
  featured_artists?: string[];
  genre?: string;
  subgenre?: string;
  label?: string;
  copyright_line?: string;
  thumbnail_url?: string;
  video_url?: string;
  release_date?: string;
  sales_start_date?: string;
  presave_option?: string;
  presave_date?: string;
  pricing?: string;
  selected_territories?: string[];
  selected_services?: string[];
  status?: ReleaseStatus;
}

export default function MusicVideoReleaseBuilder() {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<ReleaseSection>("basic-info");
  const [releaseName, setReleaseName] = useState<string>("");
  const [releaseData, setReleaseData] = useState<MusicVideoReleaseData | null>(null);
  const [territoriesAndServicesData, setTerritoriesAndServicesData] = useState<{
    selectedTerritories: string[];
    selectedServices: string[];
  }>({ selectedTerritories: [], selectedServices: [] });

  const { data: release, isLoading, error } = useQuery({
    queryKey: ['music-video-release', id],
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

      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (release) {
      setReleaseData(release);
      setReleaseName(release.release_name);
      setTerritoriesAndServicesData({
        selectedTerritories: release.selected_territories || [],
        selectedServices: release.selected_services || [],
      });
    }
  }, [release]);

  useEffect(() => {
    if (id && releaseData) {
      const updateRelease = async () => {
        const { error } = await supabase
          .from('releases')
          .update({
            selected_territories: territoriesAndServicesData.selectedTerritories,
            selected_services: territoriesAndServicesData.selectedServices,
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating territories and services:', error);
          toast({
            title: "Error",
            description: "Failed to save territories and services",
            variant: "destructive",
          });
        }
      };

      updateRelease();
    }
  }, [territoriesAndServicesData, id]);

  const handleUpdateReleaseData = (newData: Partial<MusicVideoReleaseData>) => {
    setReleaseData(prev => prev ? { ...prev, ...newData } : newData as MusicVideoReleaseData);
  };

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
              releaseName: releaseData?.release_name || "",
              upc: releaseData?.upc,
              catalogNumber: releaseData?.catalog_number || "",
              format: "Music Video",
              metadataLanguage: releaseData?.metadata_language,
              primaryArtists: releaseData?.primary_artists,
              featuredArtists: releaseData?.featured_artists,
              genre: releaseData?.genre,
              subgenre: releaseData?.subgenre,
              label: releaseData?.label,
              copyrightLine: releaseData?.copyright_line,
            }}
            onUpdateReleaseName={setReleaseName}
            onNext={() => setCurrentSection("thumbnail")}
          />
        );
      case "thumbnail":
        return (
          <Artwork
            initialData={{ artworkUrl: releaseData?.thumbnail_url }}
            onArtworkUpdate={(url) => handleUpdateReleaseData({ thumbnail_url: url })}
            onNext={() => setCurrentSection("video")}
            title="Thumbnail"
            description="Upload your video thumbnail"
          />
        );
      case "video":
        return (
          <VideoUpload
            initialData={{ videoUrl: releaseData?.video_url }}
            onVideoUpdate={(url) => handleUpdateReleaseData({ video_url: url })}
            onNext={() => setCurrentSection("scheduling")}
          />
        );
      case "scheduling":
        return (
          <Scheduling
            initialData={{
              releaseDate: releaseData?.release_date ? new Date(releaseData.release_date) : undefined,
              salesStartDate: releaseData?.sales_start_date ? new Date(releaseData.sales_start_date) : undefined,
              presaveOption: releaseData?.presave_option,
              presaveDate: releaseData?.presave_date ? new Date(releaseData.presave_date) : undefined,
              pricing: releaseData?.pricing,
            }}
            onSchedulingUpdate={(data) => handleUpdateReleaseData(data)}
            onNext={() => setCurrentSection("territories")}
          />
        );
      case "territories":
        return (
          <TerritoriesAndServices 
            initialData={territoriesAndServicesData}
            onUpdateData={setTerritoriesAndServicesData}
            onNext={() => setCurrentSection("overview")}
            serviceList={[
              "Apple Music",
              "VK / OK / BOOM",
              "Yandex Music",
              "YouTube Content ID",
              "Tidal",
              "TikTok",
            ]}
          />
        );
      case "overview":
        return (
          <MusicVideoOverview
            releaseData={{
              ...releaseData,
              selected_territories: territoriesAndServicesData.selectedTerritories,
              selected_services: territoriesAndServicesData.selectedServices,
            }}
            errors={[]}
            onNext={() => {
              toast({
                title: "Success",
                description: "Music video release submitted successfully",
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <ReleaseBuilderSidebar
          releaseName={releaseName}
          upc={releaseData?.upc}
          status={releaseData?.status || "In Progress"}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          sections={[
            { id: "basic-info", label: "Basic Info" },
            { id: "thumbnail", label: "Thumbnail" },
            { id: "video", label: "Video" },
            { id: "scheduling", label: "Scheduling and Pricing" },
            { id: "territories", label: "Territories and Services" },
            { id: "overview", label: "Overview" },
          ]}
        />
        <main className="flex-1 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </SidebarProvider>
  );
}
