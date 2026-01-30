import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import Link from 'next/link';
import { LayoutDashboard, PenTool, FolderOpen, LogOut, X, Info } from 'lucide-react';
import { AdminBanner } from './AdminBanner';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/blog', icon: PenTool, label: 'Blog' },
    { href: '/admin/projects', icon: FolderOpen, label: 'Projets' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Admin Banner - Info about 3D interface */}
      <AdminBanner />

      {/* Sidebar */}
      <aside className="w-16 lg:w-56 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-100">Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 lg:p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500 hidden lg:block truncate max-w-[150px]">
              {session.user?.email}
            </p>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
