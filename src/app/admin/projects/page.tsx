import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, Star } from 'lucide-react';
import { getProjects, deleteProject } from '@/actions/projects';
import { revalidatePath } from 'next/cache';

function DeleteButton({ id }: { id: string }) {
  'use server';
  async function handleDelete() {
    await deleteProject(id);
    revalidatePath('/admin/projects');
  }

  return (
    <form action={handleDelete}>
      <button
        type="submit"
        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
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

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Projets</h1>
          <p className="text-zinc-500 text-sm mt-1">{projects.length} projet{projects.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500 mb-4">Aucun projet</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
          >
            <Plus className="h-4 w-4" />
            Créer le premier
          </Link>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Projet</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Année</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {project.thumbnail ? (
                        <div className="h-12 w-16 rounded overflow-hidden bg-zinc-900 shrink-0">
                          <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-16 rounded bg-zinc-900 flex items-center justify-center shrink-0">
                          <span className="text-zinc-700 text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-200">{project.title}</p>
                          {project.featured && <Star className="h-3 w-3 text-amber-500" fill={'currentColor'} />}
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {categoryLabels[project.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{project.year}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/portfolio/${project.slug}`}
                        target="_blank"
                        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
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
