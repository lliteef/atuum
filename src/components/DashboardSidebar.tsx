
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart2, Settings, Home, Disc3, Archive, Trash2, Rocket, Landmark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: isModerator } = useQuery({
    queryKey: ['is-moderator'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_role', {
        role_to_check: 'moderator'
      });
      
      if (error) throw error;
      return data;
    }
  });

  const moderatorMenuItems = [
    {
      title: "Workstation",
      icon: Home,
      path: "/",
    },
    {
      title: "Physical Requests",
      icon: Disc3,
      path: "/physical-requests",
    },
    {
      title: "Released Content",
      icon: Archive,
      path: "/released-content",
    },
    {
      title: "Taken Down Content",
      icon: Trash2,
      path: "/taken-down-content",
    },
    {
      title: "Marketing",
      icon: Rocket,
      path: "/fansifter",
    },
    {
      title: "Insights",
      icon: BarChart2,
      path: "/insights",
    },
    {
      title: "Accounting",
      icon: Landmark,
      path: "/accounting",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const regularMenuItems = [
    {
      title: "Workstation",
      icon: Home,
      path: "/",
    },
    {
      title: "Marketing",
      icon: Rocket,
      path: "/fansifter",
    },
    {
      title: "Insights",
      icon: BarChart2,
      path: "/insights",
    },
    {
      title: "Accounting",
      icon: Landmark,
      path: "/accounting",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const menuItems = isModerator ? moderatorMenuItems : regularMenuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={`w-full ${
                      location.pathname === item.path
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
