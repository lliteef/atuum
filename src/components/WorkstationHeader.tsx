import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
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
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{
    email: string | undefined;
    id: string | undefined;
    roles: Database['public']['Enums']['app_role'][];
    firstName: string | undefined;
    lastName: string | undefined;
  }>({
    email: undefined,
    id: undefined,
    roles: [],
    firstName: undefined,
    lastName: undefined,
  });

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [{ data: roles }, { data: profile }] = await Promise.all([
          supabase.rpc('get_user_roles', {
            user_id: user.id
          }),
          supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single()
        ]);

        setUserInfo({
          email: user.email,
          id: user.id,
          roles: roles || [],
          firstName: profile?.first_name,
          lastName: profile?.last_name,
        });
      }
    };
    getUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const displayName = userInfo.firstName && userInfo.lastName
    ? `${userInfo.firstName} ${userInfo.lastName}`
    : userInfo.email;

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
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{displayName}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-accent">
              {userInfo.roles.length > 0 
                ? userInfo.roles.map(role => getRoleDisplayName(role)).join(', ')
                : 'No roles'}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}