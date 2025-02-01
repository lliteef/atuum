import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Workstation from "@/pages/Workstation";
import ReleaseBuilder from "@/pages/ReleaseBuilder";
import Settings from "@/pages/Settings";
import Insights from "@/pages/Insights";
import Accounting from "@/pages/Accounting";
import Fansifter from "@/pages/Fansifter";
import ConfirmInvitation from "@/pages/ConfirmInvitation";

function App() {
  return (
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
  );
}

export default App;