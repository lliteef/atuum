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
import { BarChart2, Cog, Home, Music2, Rocket, Wallet, Archive } from "lucide-react";
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

  const menuItems = [
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
      icon: Wallet,
      path: "/accounting",
    },
    {
      title: "Settings",
      icon: Cog,
      path: "/settings",
    },
  ];

  // Add Released Content menu item for moderators
  if (isModerator) {
    menuItems.push({
      title: "Released Content",
      icon: Archive,
      path: "/released-content",
    });
  }

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