import Link from 'next/link';
import type { DashboardPostItem, DashboardProjectItem } from '@/types/component';

interface RecentContentProps {
  posts: DashboardPostItem[];
  projects: DashboardProjectItem[];
}

export function RecentContent({ posts, projects }: RecentContentProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {posts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Articles récents</h2>
          <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
            {posts.slice(0, 3).map((post) => (
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
  );
}
