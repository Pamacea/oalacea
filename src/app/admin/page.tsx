import Link from 'next/link';
import { getPosts } from '@/actions/blog';
import { getProjects } from '@/actions/projects';
import { PenTool, FolderOpen, Plus } from 'lucide-react';

export const revalidate = 30;

export default async function AdminPage() {
  const [posts, projects] = await Promise.all([
    getPosts({ published: false, page: 1, limit: 5 }),
    getProjects(),
  ]);

  const stats = [
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Tableau de bord</h1>
        <p className="text-zinc-500 text-sm mt-1">Bienvenue dans le panneau d'administration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="block p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">→</span>
            </div>
            <p className="text-2xl font-semibold text-zinc-100">{stat.value}</p>
            <p className="text-sm text-zinc-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-3 p-4 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
        >
          <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
            <Plus className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-zinc-200">Nouvel article</p>
            <p className="text-xs text-zinc-500">Créer un article de blog</p>
          </div>
        </Link>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-3 p-4 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
        >
          <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
            <Plus className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-zinc-200">Nouveau projet</p>
            <p className="text-xs text-zinc-500">Ajouter un projet portfolio</p>
          </div>
        </Link>
      </div>

      {/* Recent Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Posts */}
        {posts.posts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Articles récents</h2>
            <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
              {posts.posts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}`}
                  className="block p-4 hover:bg-zinc-900/30 transition-colors"
                >
                  <p className="font-medium text-zinc-200 text-sm">{post.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Projets récents</h2>
            <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
              {projects.slice(0, 3).map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="block p-4 hover:bg-zinc-900/30 transition-colors"
                >
                  <p className="font-medium text-zinc-200 text-sm">{project.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{project.year} · {project.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
