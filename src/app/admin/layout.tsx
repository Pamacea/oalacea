import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import Link from 'next/link';
import { LayoutDashboard, PenTool, FolderOpen, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-imperium-black flex">
      {/* Sidebar */}
      <aside className="w-16 lg:w-56 border-r-2 border-imperium-steel-dark bg-imperium-black flex flex-col">
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b-2 border-imperium-steel-dark">
          <h1 className="font-display text-lg uppercase tracking-wider text-imperium-crimson">
            [ ADMIN ]
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 lg:p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-none border-2 border-transparent font-terminal text-sm text-imperium-steel hover:text-imperium-gold hover:border-imperium-gold/50 hover:bg-imperium-gold/10 transition-all"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline uppercase">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t-2 border-imperium-steel-dark">
          <div className="flex items-center justify-between">
            <p className="font-terminal text-xs text-imperium-steel-dark hidden lg:block truncate max-w-[150px]">
              {'>'} {session.user?.email}
            </p>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
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
