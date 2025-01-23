import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkstationHeader } from "@/components/WorkstationHeader";

import Workstation from "./pages/Workstation";
import Settings from "./pages/Settings";
import Insights from "./pages/Insights";
import Accounting from "./pages/Accounting";
import Fansifter from "./pages/Fansifter";
import ReleaseBuilder from "./pages/ReleaseBuilder";
import Auth from "./pages/Auth";
import ConfirmInvitation from "./pages/ConfirmInvitation";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null; // or a loading spinner
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex flex-col w-full bg-[#0F172A] text-white">
      <WorkstationHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/confirm-invitation" element={<ConfirmInvitation />} />
          <Route path="/release-builder" element={
            <ProtectedRoute>
              <ReleaseBuilder />
            </ProtectedRoute>
          } />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Workstation />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Insights />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Accounting />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fansifter" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Fansifter />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;