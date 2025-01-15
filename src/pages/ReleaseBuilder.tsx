import { useLocation } from "react-router-dom";
import { ReleaseBuilderSidebar } from "@/components/ReleaseBuilderSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ReleaseBuilder() {
  const location = useLocation();
  const releaseData = location.state || {
    releaseName: "New Release",
    upc: undefined,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0F172A] text-white">
        <ReleaseBuilderSidebar
          releaseName={releaseData.releaseName}
          upc={releaseData.upc}
          status="In Progress"
        />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold">Release Builder</h1>
          {/* Content for each section will be added here */}
        </main>
      </div>
    </SidebarProvider>
  );
}