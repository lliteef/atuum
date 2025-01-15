import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";

import Workstation from "./pages/Workstation";
import Settings from "./pages/Settings";
import Insights from "./pages/Insights";
import Accounting from "./pages/Accounting";
import Fansifter from "./pages/Fansifter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-[#0F172A] text-white">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Workstation />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/fansifter" element={<Fansifter />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;