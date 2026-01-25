import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, Star } from 'lucide-react';
import { getProjects, deleteProject } from '@/actions/projects';
import { ProjectCategory } from '@/generated/prisma/enums';

function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    'use server';
    await deleteProject(id);
  }

  return (
    <form action={handleDelete}>
      <button
        type="submit"
        className="rounded p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

const categoryColors: Record<ProjectCategory, string> = {
  WEB: 'bg-blue-500/10 text-blue-400',
  MOBILE: 'bg-green-500/10 text-green-400',
  THREE_D: 'bg-purple-500/10 text-purple-400',
  AI: 'bg-orange-500/10 text-orange-400',
  OTHER: 'bg-slate-500/10 text-slate-400',
};

const categoryLabels: Record<ProjectCategory, string> = {
  WEB: 'Web',
  MOBILE: 'Mobile',
  THREE_D: '3D',
  AI: 'IA',
  OTHER: 'Autre',
};

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projets</h1>
          <p className="text-slate-400">
            {projects.length} projet{projects.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/10 bg-slate-900/50 p-12 text-center text-slate-500">
            Aucun projet. Créez votre premier projet !
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-white/10 bg-slate-900/50 p-4 transition-all hover:border-white/20"
            >
              <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-600">
                    <Eye className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white truncate">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <Star className="h-4 w-4 text-yellow-500 shrink-0" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    categoryColors[project.category]
                  }`}
                >
                  {categoryLabels[project.category]}
                </span>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    target="_blank"
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                    title="Voir"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteButton id={project.id} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="text-xs rounded bg-slate-800 px-2 py-0.5 text-slate-400"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="text-xs rounded bg-slate-800 px-2 py-0.5 text-slate-400">
                    +{project.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
