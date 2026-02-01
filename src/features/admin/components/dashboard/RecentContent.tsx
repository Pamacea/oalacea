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
          <h2 className="font-display text-xs uppercase tracking-wider text-imperium-crimson mb-4 border-l-2 border-imperium-crimson pl-2">
            [ Articles récents ]
          </h2>
          <div className="border-2 border-imperium-steel-dark rounded-none divide-y-2 divide-imperium-steel-dark overflow-hidden">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/admin/blog/${post.id}`}
                className="block p-4 hover:bg-imperium-crimson/10 transition-colors border-l-2 border-transparent hover:border-imperium-crimson"
              >
                <p className="font-display text-sm uppercase tracking-wider text-imperium-bone">{post.title}</p>
                <p className="font-terminal text-xs text-imperium-steel-dark mt-1">
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
          <h2 className="font-display text-xs uppercase tracking-wider text-imperium-gold mb-4 border-l-2 border-imperium-gold pl-2">
            [ Projets récents ]
          </h2>
          <div className="border-2 border-imperium-steel-dark rounded-none divide-y-2 divide-imperium-steel-dark overflow-hidden">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="block p-4 hover:bg-imperium-gold/10 transition-colors border-l-2 border-transparent hover:border-imperium-gold"
              >
                <p className="font-display text-sm uppercase tracking-wider text-imperium-bone">{project.title}</p>
                <p className="font-terminal text-xs text-imperium-steel-dark mt-1">{project.year} · {project.category}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
