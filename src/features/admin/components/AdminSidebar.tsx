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
import { useWorldTheme } from '@/components/theme';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { Session } from 'next-auth';

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
  const { colors, isDark } = useWorldTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          color: colors.text.primary,
        }}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r backdrop-blur-sm transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: isDark ? 'rgba(10, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <div
          className="flex h-16 items-center border-b px-6"
          style={{ borderColor: colors.border }}
        >
          <h1
            className="text-xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Admin
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
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? `${colors.text.primary}20` : 'transparent',
                  color: isActive ? colors.text.primary : colors.text.secondary,
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div
          className="absolute bottom-0 left-0 right-0 border-t p-4"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${colors.text.primary}, ${colors.text.secondary})`,
                color: '#fff',
              }}
            >
              {session.user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p
                className="truncate text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                {session.user?.name}
              </p>
              <p
                className="truncate text-xs"
                style={{ color: colors.text.secondary }}
              >
                {session.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: colors.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${colors.text.primary}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
