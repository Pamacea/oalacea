'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, Globe } from 'lucide-react';
import { useProjects } from '@/features/portfolio/queries/useProjects';
import { useDeleteProject } from './queries/use-project-mutations';
import { useInWorldAdminStore } from '@/features/admin/store';
import { ConfirmDialog } from './ConfirmDialog';
import { CardGridSkeleton } from '@/features/admin/components';

const worldFilters = [
  { value: 'all' as const, label: 'Tous', icon: Globe },
  { value: 'DEV' as const, label: 'Dev', icon: Globe },
  { value: 'ART' as const, label: 'Art', icon: Globe },
] as const;

type WorldFilter = 'all' | 'DEV' | 'ART';

export function ProjectsTab() {
  const { setView } = useInWorldAdminStore();
  const { data: projects, isLoading } = useProjects();
  const deleteMutation = useDeleteProject();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: '',
    title: '',
  });
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [worldFilter, setWorldFilter] = useState<WorldFilter>('all');

  const filteredProjects = projects?.filter((p) => {
    if (worldFilter === 'all') return true;
    return p.worldPosition?.world === worldFilter;
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteDialog.id);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 2000);
    } finally {
      setDeleteDialog({ ...deleteDialog, open: false });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with filters and add button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-200">Projets</h2>
          <button
            onClick={() => setView('create-project')}
            className="flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouveau projet
          </button>
        </div>

        {/* World filter */}
        <div className="flex items-center gap-2">
          {worldFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setWorldFilter(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                worldFilter === filter.value
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Thumbnail */}
                  {project.thumbnail && (
                    <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {project.featured && (
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      )}
                      <h3 className="truncate font-medium text-zinc-200">{project.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {project.category.name}
                    </span>
                    {project.worldPosition?.world && (
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${
                        project.worldPosition.world === 'DEV'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                          : 'bg-pink-950 text-pink-400 border-pink-900'
                      }`}>
                        {project.worldPosition.world}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setView('edit-project');
                        // Store project ID in sessionStorage for the edit form
                        sessionStorage.setItem('editProjectId', project.id);
                      }}
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
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-500 mb-4">Aucun projet pour le moment</p>
            <button
              onClick={() => setView('create-project')}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Créer un projet
            </button>
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
        isLoading={deleteMutation.isPending}
        isSuccess={deleteSuccess}
      />
    </>
  );
}
