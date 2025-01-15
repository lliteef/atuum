import { ReleaseBuilderSidebar } from "@/components/ReleaseBuilderSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ReleaseBuilder() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0F172A] text-white">
        <ReleaseBuilderSidebar
          releaseName="New Release"
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