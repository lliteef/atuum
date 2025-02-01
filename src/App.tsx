import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/workstation" element={<Workstation />} />
            <Route path="/release-builder/:id" element={<ReleaseBuilder />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/fansifter" element={<Fansifter />} />
            <Route path="/confirm-invitation" element={<ConfirmInvitation />} />
          </Routes>
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;