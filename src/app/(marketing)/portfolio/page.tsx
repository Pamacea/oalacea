import { getProjects } from '@/actions/projects';

export const dynamic = 'force-static';
export const revalidate = 300; // Revalidate every 5 minutes

export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">Aucun projet pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
              >
                {/* Thumbnail */}
                {project.thumbnail && (
                  <div className="aspect-video overflow-hidden border-b border-zinc-800">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h2 className="text-lg font-semibold text-zinc-100 mb-2 line-clamp-1">
                    <a href={`/portfolio/${project.slug}`} className="hover:text-zinc-300 transition-colors">
                      {project.title}
                    </a>
                  </h2>

                  {/* Description */}
                  <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                    <span>{project.year}</span>
                    <span>·</span>
                    <span className="uppercase">{project.category}</span>
                  </div>

                  {/* Tech Stack */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
