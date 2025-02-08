
import { Circle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Database } from "@/integrations/supabase/types";

type ReleaseStatus = Database["public"]["Enums"]["release_status"];
export type ReleaseSection = "basic-info" | "thumbnail" | "video" | "scheduling" | "territories" | "overview";

interface ReleaseBuilderSidebarProps {
  releaseName: string;
  upc?: string;
  status: ReleaseStatus;
  currentSection: ReleaseSection;
  onSectionChange: (section: ReleaseSection) => void;
  sections: { id: ReleaseSection; label: string }[];
}

const getStatusColor = (status: ReleaseStatus) => {
  switch (status) {
    case "In Progress":
      return "text-yellow-500";
    case "Ready":
      return "text-green-500";
    case "Moderation":
      return "text-blue-500";
    case "Sent to Stores":
      return "text-purple-500";
    case "Taken Down":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

export function ReleaseBuilderSidebar({
  releaseName,
  upc,
  status,
  currentSection,
  onSectionChange,
  sections,
}: ReleaseBuilderSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Release Details</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-4 p-2">
              <div>
                <h3 className="text-lg font-semibold">{releaseName}</h3>
                <p className="text-sm text-gray-400">
                  {upc || "UPC will be assigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Circle
                  className={`h-3 w-3 fill-current ${getStatusColor(status)}`}
                />
                <span className="text-sm">{status}</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Release Information</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`w-full rounded-md p-2 text-left transition-colors ${
                    currentSection === section.id
                      ? "bg-white/10 text-white"
                      : "bg-card hover:bg-card/90 text-gray-300"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
