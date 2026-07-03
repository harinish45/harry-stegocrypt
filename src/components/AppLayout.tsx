import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-secondary/10">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-background/60 backdrop-blur px-3 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                Client-side cybersecurity toolkit
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
          <footer className="text-center text-xs text-muted-foreground py-4 border-t">
            StegoCrypt Pro — all keys stay in your browser. No servers. No tracking.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
