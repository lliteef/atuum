import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/confirm-invitation" element={<ConfirmInvitation />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-[#0F172A] text-white">
                    <DashboardSidebar />
                    <main className="flex-1 overflow-auto">
                      <Workstation />
                    </main>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting" 
            element={
              <ProtectedRoute>
                <Accounting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fansifter" 
            element={
              <ProtectedRoute>
                <Fansifter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/release-builder" 
            element={
              <ProtectedRoute>
                <ReleaseBuilder />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;