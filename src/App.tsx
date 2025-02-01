import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Workstation from "@/pages/Workstation";
import Settings from "@/pages/Settings";
import Insights from "@/pages/Insights";
import Accounting from "@/pages/Accounting";
import Fansifter from "@/pages/Fansifter";
import ConfirmInvitation from "@/pages/ConfirmInvitation";
import ReleaseBuilder from "@/pages/ReleaseBuilder";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/workstation" element={<Workstation />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/fansifter" element={<Fansifter />} />
            <Route path="/confirm-invitation" element={<ConfirmInvitation />} />
            <Route path="/release-builder/:id" element={<ReleaseBuilder />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;