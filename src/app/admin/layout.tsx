import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-imperium-black flex relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <AdminSidebar session={session} />

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-imperium-crimson/20">
          <div className="h-full bg-imperium-crimson w-1/4" />
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
