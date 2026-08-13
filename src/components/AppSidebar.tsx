import { NavLink, useLocation } from 'react-router-dom';
import xaraLogo from '@/assets/xara-logo.png.asset.json';
import { useTranslation } from 'react-i18next';
import {
  Shield, Image as ImageIcon, FileLock, Hash, KeyRound, QrCode,
  Lock, Fingerprint, ShieldCheck, Timer, Link2, Sparkles
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, useSidebar
} from '@/components/ui/sidebar';

const groups = [
  {
    label: 'Steganography',
    items: [
      { title: 'Image LSB', url: '/', icon: ImageIcon },
    ],
  },
  {
    label: 'Cryptography',
    items: [
      { title: 'File Encryption', url: '/file-crypto', icon: FileLock },
      { title: 'Hash & HMAC', url: '/hash', icon: Hash },
      { title: 'Password Generator', url: '/password', icon: KeyRound },
    ],
  },
  {
    label: 'Keys & Sharing',
    items: [
      { title: 'QR Key Exchange', url: '/qr', icon: QrCode },
      { title: 'One-Time Link', url: '/one-time', icon: Link2 },
      { title: 'TOTP / 2FA', url: '/totp', icon: Timer },
    ],
  },
  {
    label: 'Forensics',
    items: [
      { title: 'Image Analysis', url: '/forensics', icon: Fingerprint },
      { title: 'Security Guide', url: '/security', icon: ShieldCheck },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          {collapsed ? (
            <div className="w-8 h-8 rounded-md bg-primary/10 grid place-items-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          ) : (
            <img
              src={xaraLogo.url}
              alt="xara stegocrypt"
              className="h-6 w-auto object-contain invert [.theme-light_&]:invert-0"
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <NavLink to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
