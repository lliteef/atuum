import { Circle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

type ReleaseStatus = "In Progress" | "Ready" | "Moderation" | "Sent to Stores";

interface ReleaseBuilderSidebarProps {
  releaseName: string;
  upc?: string;
  status: ReleaseStatus;
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
    default:
      return "text-gray-500";
  }
};

export function ReleaseBuilderSidebar({
  releaseName,
  upc,
  status,
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
              <div className="rounded-md bg-card p-2 hover:bg-card/90">
                Basic Info
              </div>
              <div className="rounded-md bg-card p-2 hover:bg-card/90">
                Artwork
              </div>
              <div className="rounded-md bg-card p-2 hover:bg-card/90">
                Tracks
              </div>
              <div className="rounded-md bg-card p-2 hover:bg-card/90">
                Scheduling and Pricing
              </div>
              <div className="rounded-md bg-card p-2 hover:bg-card/90">
                Territories and Services
              </div>
              <div className="rounded-md bg-card p-2 hover:bg-card/90">
                Publishing
              </div>
              <div className="rounded-md bg-card p-2 hover:bg-card/90">
                Overview
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}