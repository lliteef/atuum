import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import Workstation from "@/pages/Workstation";
import ReleaseBuilder from "@/pages/ReleaseBuilder";
import ReleaseViewer from "@/pages/ReleaseViewer";
import Settings from "@/pages/Settings";
import Insights from "@/pages/Insights";
import Accounting from "@/pages/Accounting";
import Fansifter from "@/pages/Fansifter";
import ReleasedContent from "@/pages/ReleasedContent";
import TakenDownContent from "@/pages/TakenDownContent";
import ConfirmInvitation from "@/pages/ConfirmInvitation";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { WorkstationHeader } from "@/components/WorkstationHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import PhysicalRequests from "@/pages/PhysicalRequests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isReleaseBuilder = location.pathname.includes('/release-builder');
  const isReleaseViewer = location.pathname.includes('/release-viewer');
  const isAuth = location.pathname === '/auth';
  const isConfirmInvitation = location.pathname === '/confirm-invitation';

  if (isReleaseBuilder || isReleaseViewer || isAuth || isConfirmInvitation) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <WorkstationHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark">
          <SidebarProvider>
            <Routes>
              <Route
                path="/"
                element={
                  session ? (
                    <AppLayout>
                      <Workstation />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/auth"
                element={
                  !session ? (
                    <Auth />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/workstation"
                element={<Navigate to="/" replace />}
              />
              <Route
                path="/release-builder/:id"
                element={
                  session ? (
                    <ReleaseBuilder />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/release-viewer/:id"
                element={
                  session ? (
                    <ReleaseViewer />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/released-content"
                element={
                  session ? (
                    <AppLayout>
                      <ReleasedContent />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/taken-down-content"
                element={
                  session ? (
                    <AppLayout>
                      <TakenDownContent />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/physical-requests"
                element={
                  session ? (
                    <AppLayout>
                      <PhysicalRequests />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/settings"
                element={
                  session ? (
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/insights"
                element={
                  session ? (
                    <AppLayout>
                      <Insights />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/accounting"
                element={
                  session ? (
                    <AppLayout>
                      <Accounting />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/fansifter"
                element={
                  session ? (
                    <AppLayout>
                      <Fansifter />
                    </AppLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route path="/confirm-invitation" element={<ConfirmInvitation />} />
            </Routes>
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
