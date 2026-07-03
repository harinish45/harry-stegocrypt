import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { AiChatDrawer } from './AiChatDrawer';
import { ShieldCheck } from 'lucide-react';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Ambient gradient backdrop */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <header className="relative h-14 flex items-center justify-between border-b bg-background/70 backdrop-blur-xl px-3 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border/60 bg-background/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Client-side · zero telemetry
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </header>

          <main className="relative flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto w-full">
              <Outlet />
            </div>
          </main>

          <footer className="relative text-center text-xs text-muted-foreground py-4 border-t bg-background/40 backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              StegoCrypt Pro — all keys stay in your browser. No servers. No tracking.
            </span>
          </footer>
        </div>

        <AiChatDrawer />
      </div>
    </SidebarProvider>
  );
}
