import { useLocation } from "react-router-dom";
import { ReleaseBuilderSidebar } from "@/components/ReleaseBuilderSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BasicInfo } from "@/components/release-builder/BasicInfo";
import { useState } from "react";

export default function ReleaseBuilder() {
  const location = useLocation();
  const [releaseName, setReleaseName] = useState(
    location.state?.releaseName || "New Release"
  );
  
  const releaseData = {
    releaseName,
    upc: location.state?.upc,
    catalogNumber: location.state?.releaseNo || "",
    format: location.state?.format || "Single",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0F172A] text-white">
        <ReleaseBuilderSidebar
          releaseName={releaseName}
          upc={releaseData.upc}
          status="In Progress"
        />
        <main className="flex-1 overflow-auto">
          <BasicInfo
            initialData={releaseData}
            onUpdateReleaseName={setReleaseName}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}