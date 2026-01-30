import { getPosts } from '@/actions/blog';
import { getProjects } from '@/actions/projects';
import { PenTool, FolderOpen } from 'lucide-react';
import { AdminHeader, AdminStatsGrid, QuickActions, RecentContent } from '@/features/admin/components/dashboard';
import type { StatCard } from '@/types/component';

export const revalidate = 30;

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
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-800/50',
    },
    {
      label: 'Projets',
      value: projects.length,
      href: '/admin/projects',
      icon: FolderOpen,
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-800/50',
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
