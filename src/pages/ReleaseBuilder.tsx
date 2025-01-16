import { useLocation } from "react-router-dom";
import { ReleaseBuilderSidebar } from "@/components/ReleaseBuilderSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BasicInfo } from "@/components/release-builder/BasicInfo";
import { Artwork } from "@/components/release-builder/Artwork";
import { Tracks } from "@/components/release-builder/Tracks";
import { useState } from "react";

type Section = "basic-info" | "artwork" | "tracks" | "scheduling" | "territories" | "publishing" | "overview";

export default function ReleaseBuilder() {
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState<Section>("basic-info");
  const [releaseName, setReleaseName] = useState(
    location.state?.releaseName || "New Release"
  );
  
  const releaseData = {
    releaseName,
    upc: location.state?.upc,
    catalogNumber: location.state?.releaseNo || "",
    format: location.state?.format || "Single",
  };

  const handleSectionChange = (section: Section) => {
    setCurrentSection(section);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0F172A] text-white">
        <ReleaseBuilderSidebar
          releaseName={releaseName}
          upc={releaseData.upc}
          status="In Progress"
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />
        <main className="flex-1 overflow-auto">
          {currentSection === "basic-info" && (
            <BasicInfo
              initialData={releaseData}
              onUpdateReleaseName={setReleaseName}
              onNext={() => handleSectionChange("artwork")}
            />
          )}
          {currentSection === "artwork" && (
            <Artwork onNext={() => handleSectionChange("tracks")} />
          )}
          {currentSection === "tracks" && (
            <Tracks onNext={() => handleSectionChange("scheduling")} />
          )}
          {/* Other sections will be added here */}
        </main>
      </div>
    </SidebarProvider>
  );
}
