import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import Workstation from "@/pages/Workstation";
import ReleaseBuilder from "@/pages/ReleaseBuilder";
import Settings from "@/pages/Settings";
import Insights from "@/pages/Insights";
import Accounting from "@/pages/Accounting";
import Fansifter from "@/pages/Fansifter";
import ConfirmInvitation from "@/pages/ConfirmInvitation";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

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
          <Routes>
            <Route
              path="/"
              element={
                session ? (
                  <Workstation />
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
              path="/settings"
              element={
                session ? (
                  <Settings />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/insights"
              element={
                session ? (
                  <Insights />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/accounting"
              element={
                session ? (
                  <Accounting />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/fansifter"
              element={
                session ? (
                  <Fansifter />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="/confirm-invitation" element={<ConfirmInvitation />} />
          </Routes>
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;