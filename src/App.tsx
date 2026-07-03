import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import FileCryptoPage from "./pages/FileCryptoPage";
import HashPage from "./pages/HashPage";
import PasswordPage from "./pages/PasswordPage";
import QrKeyPage from "./pages/QrKeyPage";
import OneTimeLinkPage from "./pages/OneTimeLinkPage";
import TotpPage from "./pages/TotpPage";
import ForensicsPage from "./pages/ForensicsPage";
import SecurityPage from "./pages/SecurityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/file-crypto" element={<FileCryptoPage />} />
              <Route path="/hash" element={<HashPage />} />
              <Route path="/password" element={<PasswordPage />} />
              <Route path="/qr" element={<QrKeyPage />} />
              <Route path="/one-time" element={<OneTimeLinkPage />} />
              <Route path="/totp" element={<TotpPage />} />
              <Route path="/forensics" element={<ForensicsPage />} />
              <Route path="/security" element={<SecurityPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
