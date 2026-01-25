import Link from 'next/link';
import { getPosts } from '@/actions/blog';
import { getProjects } from '@/actions/projects';
import { FileText, FolderKanban, ArrowRight } from 'lucide-react';

export default async function AdminPage() {
  const [posts, projects] = await Promise.all([
    getPosts({ published: false }),
    getProjects(),
  ]);

  const stats = [
    {
      title: 'Articles de blog',
      count: posts.pagination.total,
      href: '/admin/blog',
      icon: FileText,
      color: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Projets portfolio',
      count: projects.length,
      href: '/admin/projects',
      icon: FolderKanban,
      color: 'from-blue-500 to-cyan-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        <p className="mt-2 text-slate-400">
          Gérez votre contenu et vos projets
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-white/20 hover:bg-slate-900/80"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity group-hover:opacity-10`} />
              <div className="relative">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.count}</p>
                <ArrowRight className="mt-4 h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Actions rapides
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/blog/new"
              className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <span>Nouvel article de blog</span>
              <span className="text-violet-400">+</span>
            </Link>
            <Link
              href="/admin/projects/new"
              className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <span>Nouveau projet</span>
              <span className="text-blue-400">+</span>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Derniers articles</h2>
          {posts.posts.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun article pour le moment</p>
          ) : (
            <div className="space-y-3">
              {posts.posts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}`}
                  className="block rounded-lg border border-white/5 bg-slate-800/30 px-4 py-3 text-sm transition-colors hover:bg-slate-800/50"
                >
                  <p className="font-medium text-white">{post.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
