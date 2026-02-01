import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, Star, Globe } from 'lucide-react';
import { getProjects, deleteProjectWithRevalidate } from '@/actions/projects';

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteProjectWithRevalidate.bind(null, id)}>
      <button
        type="submit"
        className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

const categoryLabels: Record<string, string> = {
  WEB: 'Web',
  MOBILE: 'Mobile',
  THREE_D: '3D',
  AI: 'IA',
  OTHER: 'Autre',
};

export const revalidate = 30;

interface AdminProjectsPageProps {
  searchParams: { world?: 'all' | 'DEV' | 'ART' };
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const worldFilter = searchParams.world || 'all';
  const projects = await getProjects(worldFilter === 'all' ? {} : { world: worldFilter });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wider text-imperium-crimson">
              [ Projects ]
            </h1>
            <p className="font-terminal text-imperium-steel-dark text-sm mt-1">
              {'>'} {projects.length} projet{projects.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-bone border-2 border-imperium-crimson bg-imperium-crimson rounded-none hover:bg-imperium-crimson/90 hover:shadow-[4px_4px_0_rgba(154,17,21,0.4)] transition-all"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-imperium-steel-dark rounded-none">
          <p className="font-terminal text-imperium-steel-dark mb-4">
            {'>'} {worldFilter === 'all' ? 'No projects' : `No projects in ${worldFilter} world`}
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black rounded-none hover:border-imperium-gold hover:bg-imperium-gold/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create first
          </Link>
        </div>
      ) : (
        <div className="border-2 border-imperium-steel-dark rounded-none overflow-hidden">
          <table className="w-full">
            <thead className="bg-imperium-iron border-b-2 border-imperium-steel-dark">
              <tr>
                <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">World</th>
                <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Year</th>
                <th className="px-6 py-4 text-right font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-imperium-steel-dark">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-imperium-iron transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {project.thumbnail ? (
                        <div className="h-12 w-16 rounded-none overflow-hidden border-2 border-imperium-steel-dark bg-imperium-black shrink-0">
                          <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-16 rounded-none border-2 border-imperium-steel-dark bg-imperium-black flex items-center justify-center shrink-0">
                          <span className="font-terminal text-xs text-imperium-steel-dark">No img</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display text-sm uppercase text-imperium-bone">{project.title}</p>
                          {project.featured && <Star className="h-3 w-3 text-imperium-gold" fill={'currentColor'} />}
                        </div>
                        <p className="font-terminal text-xs text-imperium-steel-dark line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 font-terminal text-xs font-medium rounded-none border-2 border-imperium-steel bg-imperium-iron text-imperium-steel">
                      {categoryLabels[project.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {project.worldPosition ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 font-terminal text-xs font-medium rounded-none border-2 ${
                        project.worldPosition.world === 'DEV'
                          ? 'border-imperium-warp bg-imperium-warp/20 text-imperium-warp'
                          : 'border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson'
                      }`}>
                        <Globe className="h-3 w-3" />
                        {project.worldPosition.world}
                      </span>
                    ) : (
                      <span className="font-terminal text-xs text-imperium-steel-dark">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-terminal text-sm text-imperium-steel-dark">{project.year}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/portfolio/${project.slug}`}
                        target="_blank"
                        className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="p-2 text-imperium-steel hover:text-imperium-gold transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={project.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
