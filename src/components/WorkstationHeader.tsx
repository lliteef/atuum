import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

const getRoleDisplayName = (role: Database['public']['Enums']['app_role']): string => {
  const displayNames: Record<Database['public']['Enums']['app_role'], string> = {
    'system_admin': 'System Administrator',
    'label_admin': 'Label Administrator',
    'moderator': 'Moderator',
    'regular_user': 'Regular User'
  };
  return displayNames[role];
};

export function WorkstationHeader() {
  const [userInfo, setUserInfo] = useState<{
    email: string | undefined;
    id: string | undefined;
    roles: Database['public']['Enums']['app_role'][];
  }>({
    email: undefined,
    id: undefined,
    roles: [],
  });

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase.rpc('get_user_roles', {
          user_id: user.id
        });
        setUserInfo({
          email: user.email,
          id: user.id,
          roles: roles || [],
        });
      }
    };
    getUserInfo();
  }, []);

  return (
    <div className="bg-card border-b border-border/40">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
            alt="Logo" 
            className="h-8 w-8 object-cover rounded"
          />
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{userInfo.email}</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-accent">
            {userInfo.roles.length > 0 
              ? userInfo.roles.map(role => getRoleDisplayName(role)).join(', ')
              : 'No roles'}
          </span>
        </div>
      </div>
    </div>
  );
}