'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  LogOut,
  Menu,
  X,
  Skull,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { Session } from 'next-auth';
import { cn } from '@/lib/utils';
import { GlitchText } from '@/components/ui/imperium';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'COMMAND', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'ARCHIVES', icon: FileText },
  { href: '/admin/projects', label: 'FORGE', icon: FolderKanban },
];

interface AdminSidebarProps {
  session: Session;
}

export function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-imperium-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-none bg-imperium-iron border-2 border-imperium-crimson text-imperium-bone hover:bg-imperium-crimson"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r-2 border-imperium-steel-dark bg-imperium-black-deep transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(154, 17, 21, 0.1) 1px,
                rgba(154, 17, 21, 0.1) 2px
              )`,
              backgroundSize: '100% 4px',
            }}
          />
        </div>

        <div className="relative flex h-20 items-center border-b-2 border-imperium-crimson px-6">
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-imperium-crimson" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-imperium-crimson" />

          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 border-2 border-imperium-crimson bg-imperium-crimson/10"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Skull className="h-5 w-5 text-imperium-crimson" />
            </motion.div>
            <div>
              <h1 className="font-display text-lg uppercase tracking-wider text-imperium-crimson">
                IMPERIUM
              </h1>
              <p className="font-terminal text-xs text-imperium-steel-dark">
                ADMIN_v2.0
              </p>
            </div>
          </div>
        </div>

        <nav className="relative space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-none px-4 py-3 text-sm font-display uppercase tracking-wider transition-all border-2 overflow-hidden group",
                  isActive
                    ? "bg-imperium-crimson text-imperium-bone border-imperium-crimson"
                    : "bg-transparent text-imperium-steel border-imperium-steel-dark hover:border-imperium-crimson hover:text-imperium-crimson"
                )}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-imperium-crimson"
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <Icon className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-imperium-steel-dark p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-imperium-crimson text-imperium-bone font-display font-bold">
              {session.user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-display text-imperium-bone">
                {session.user?.name || 'OPERATOR'}
              </p>
              <p className="truncate text-xs font-terminal text-imperium-steel">
                {'>'} {session.user?.email?.split('@')[0] || 'UNKNOWN'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full rounded-none border-2 border-imperium-maroon bg-imperium-maroon/20 text-imperium-crimson py-3 font-display uppercase text-sm hover:bg-imperium-crimson hover:text-imperium-bone transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            TERMINATE
          </button>
        </div>
      </aside>
    </>
  );
}
