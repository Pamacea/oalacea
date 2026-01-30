'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Star, Globe } from 'lucide-react';
import { getProjects, deleteProject } from '@/actions/projects';
import type { Project } from '@/generated/prisma/client';
import { ProjectCategory } from '@/generated/prisma/enums';
import { useInWorldAdminStore } from '@/store/in-world-admin-store';
import { ConfirmDialog } from './ConfirmDialog';
import { CardGridSkeleton } from '@/components/admin/TableSkeleton';

const categoryLabels: Record<ProjectCategory, string> = {
  WEB: 'Web',
  MOBILE: 'Mobile',
  THREE_D: '3D',
  AI: 'IA',
  OTHER: 'Autre',
};

const worldFilters = [
  { value: 'all' as const, label: 'Tous', icon: Globe },
  { value: 'DEV' as const, label: 'Dev', icon: Globe },
  { value: 'ART' as const, label: 'Art', icon: Globe },
] as const;

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: '',
    title: '',
  });
  const { setView, worldFilter, setWorldFilter } = useInWorldAdminStore();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const result = await getProjects(worldFilter === 'all' ? {} : { world: worldFilter });
      setProjects(result as Project[]);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [worldFilter]);

  const handleDelete = async () => {
    await deleteProject(deleteDialog.id);
    setDeleteDialog({ open: false, id: '', title: '' });
    fetchProjects();
  };

  if (isLoading) {
    return <CardGridSkeleton cards={4} />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-zinc-100">Projets</h2>
            <div className="flex items-center rounded-lg bg-zinc-900/50 border border-zinc-800 p-1">
              {worldFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = worldFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setWorldFilter(filter.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setView('edit-project')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nouveau projet
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center">
            <p className="text-zinc-500 text-sm mb-4">
              {worldFilter === 'all' ? 'Aucun projet' : `Aucun projet dans le monde ${worldFilter}`}
            </p>
            <button
              onClick={() => setView('edit-project')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
            >
              <Plus className="h-4 w-4" />
              Créer le premier
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group border border-zinc-800 rounded-xl bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition-colors duration-200"
              >
                <div className="mb-3 aspect-video rounded-lg bg-zinc-950 overflow-hidden">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-700 text-xs">
                      Aperçu
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-200 truncate">{project.title}</h3>
                      {project.featured && <Star className="h-4 w-4 text-amber-500 shrink-0" fill={'currentColor'} />}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {categoryLabels[project.category]}
                    </span>
                    {(project as any).worldPosition?.world && (
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${
                        (project as any).worldPosition.world === 'DEV'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                          : 'bg-pink-950 text-pink-400 border-pink-900'
                      }`}>
                        {(project as any).worldPosition.world}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setView('edit-project', project.id)}
                      aria-label={`Edit ${project.title}`}
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all duration-200"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteDialog({ open: true, id: project.id, title: project.title })
                      }
                      aria-label={`Delete ${project.title}`}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Supprimer le projet ?"
        description={`Êtes-vous sûr de vouloir supprimer « ${deleteDialog.title} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="danger"
      />
    </>
  );
}
