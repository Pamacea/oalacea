import { getPosts } from '@/actions/blog';
import { getProjects } from '@/actions/projects';
import { PenTool, FolderOpen } from 'lucide-react';
import { AdminHeader, AdminStatsGrid, QuickActions, RecentContent } from '@/features/admin/components/dashboard';
import type { StatCard } from '@/types/component';

// Force dynamic rendering - don't attempt to prerender at build time
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [posts, projects] = await Promise.all([
    getPosts({ published: false, page: 1, limit: 5 }),
    getProjects(),
  ]);

  const stats: StatCard[] = [
    {
      label: 'Articles',
      value: posts.pagination.total,
      href: '/admin/blog',
      icon: PenTool,
      color: 'text-imperium-crimson',
      bgColor: 'bg-imperium-crimson/10',
      borderColor: 'border-imperium-crimson/30',
    },
    {
      label: 'Projets',
      value: projects.length,
      href: '/admin/projects',
      icon: FolderOpen,
      color: 'text-imperium-gold',
      bgColor: 'bg-imperium-gold/10',
      borderColor: 'border-imperium-gold/30',
    },
  ];

  return (
    <div>
      <AdminHeader />
      <AdminStatsGrid stats={stats} />
      <QuickActions />
      <RecentContent posts={posts.posts} projects={projects} />
    </div>
  );
}
