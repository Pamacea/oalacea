'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  Activity,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { Session } from 'next-auth';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/projects', label: 'Projets', icon: FolderKanban },
  { href: '/admin/analytics', label: 'Analytiques', icon: BarChart3 },
  { href: '/admin/activity', label: 'Activité', icon: Activity },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
];

interface AdminSidebarProps {
  session: Session;
}

export function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-imperium-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button - Brutal Style */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-none bg-imperium-iron border-2 border-imperium-crimson text-imperium-bone hover:bg-imperium-crimson"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar - Brutal Style */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r-2 border-imperium-steel-dark bg-imperium-black-deep backdrop-blur-sm transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b-2 border-imperium-crimson px-6">
          <h1 className="font-display text-xl uppercase tracking-wider text-imperium-crimson">
            ADMIN
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-none px-4 py-3 text-sm font-display uppercase tracking-wider transition-all border-2",
                  isActive
                    ? "bg-imperium-crimson text-imperium-bone border-imperium-crimson shadow-[0_0_15px_rgba(154,17,21,0.4)]"
                    : "bg-transparent text-imperium-steel border-imperium-steel-dark hover:border-imperium-crimson hover:text-imperium-crimson"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-imperium-steel-dark p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-imperium-crimson text-imperium-bone font-display font-bold">
              {session.user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-display text-imperium-bone">
                {session.user?.name}
              </p>
              <p className="truncate text-xs font-terminal text-imperium-steel">
                {session.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full rounded-none border-2 border-imperium-crimson bg-imperium-crimson text-imperium-bone py-3 font-display uppercase text-sm hover:bg-imperium-crimson-bright transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
