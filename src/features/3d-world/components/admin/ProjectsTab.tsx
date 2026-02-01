'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, Globe, Hammer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '@/features/portfolio/queries/useProjects';
import { useDeleteProject } from './queries/use-project-mutations';
import { useInWorldAdminStore } from '@/features/admin/store';
import { ConfirmDialog } from './ConfirmDialog';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

const worldFilters = [
  { value: 'all' as const, label: 'ALL WORLDS', icon: Globe },
  { value: 'DEV' as const, label: 'DEV WORLD', icon: Globe },
  { value: 'ART' as const, label: 'ART WORLD', icon: Globe },
] as const;

type WorldFilter = 'all' | 'DEV' | 'ART';

export function ProjectsTab() {
  const { setView } = useInWorldAdminStore();
  const { projects, isLoading } = useProjects();
  const deleteMutation = useDeleteProject();
  const { playHover, playClick } = useUISound();

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
      <div className="space-y-8">
        {/* Header with filters and add button */}
        <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
          <h2 className="font-display text-2xl uppercase tracking-wider text-imperium-bone">
            <GlitchText intensity="medium">
              Forge Database
            </GlitchText>
          </h2>
          <motion.button
            onMouseEnter={playHover}
            onClick={() => {
              setView('create-project');
              playClick();
            }}
            className="flex items-center gap-2 px-4 py-2 font-display text-sm uppercase tracking-wider border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
          >
            <Plus className="h-4 w-4" />
            New Blueprint
          </motion.button>
        </div>

        {/* World filter */}
        <div className="flex items-center gap-2">
          {worldFilters.map((filter) => (
            <motion.button
              key={filter.value}
              onMouseEnter={playHover}
              onClick={() => setWorldFilter(filter.value)}
              className={`px-4 py-2 font-terminal text-sm uppercase tracking-wider border-2 transition-all ${
                worldFilter === filter.value
                  ? 'border-imperium-gold bg-imperium-gold/20 text-imperium-gold'
                  : 'border-imperium-steel-dark text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border-2 border-imperium-steel-dark bg-imperium-black/30 h-40 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative border-2 border-imperium-steel-dark bg-imperium-black/50 p-4 hover:border-imperium-gold/50 transition-all"
              >
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-imperium-gold opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between gap-3 mb-3">
                  {/* Thumbnail */}
                  {project.thumbnail && (
                    <div className="h-16 w-16 shrink-0 border-2 border-imperium-steel-dark overflow-hidden">
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
                        <Star className="h-4 w-4 text-imperium-gold" style={{ fill: 'currentColor' }} />
                      )}
                      <h3 className="font-display text-sm text-imperium-bone truncate">{project.title}</h3>
                    </div>
                    <p className="font-terminal text-xs text-imperium-steel line-clamp-2 mt-1">{project.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-terminal text-xs border border-imperium-steel-dark text-imperium-steel px-2 py-1">
                      {project.category.name}
                    </span>
                    {project.worldPosition?.world && (
                      <span className={`font-terminal text-xs border px-2 py-1 ${
                        project.worldPosition.world === 'DEV'
                          ? 'border-imperium-crimson text-imperium-crimson bg-imperium-crimson/10'
                          : 'border-imperium-teal text-imperium-teal bg-imperium-teal/10'
                      }`}>
                        {project.worldPosition.world}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      onMouseEnter={playHover}
                      onClick={() => {
                        setView('edit-project');
                        sessionStorage.setItem('editProjectId', project.id);
                        playClick();
                      }}
                      aria-label={`Edit ${project.title}`}
                      className="p-1.5 text-imperium-steel hover:text-imperium-gold hover:bg-imperium-gold/10 border border-transparent hover:border-imperium-gold/30 rounded transition-all"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </motion.button>
                    <motion.button
                      onMouseEnter={playHover}
                      onClick={() =>
                        setDeleteDialog({ open: true, id: project.id, title: project.title })
                      }
                      aria-label={`Delete ${project.title}`}
                      className="p-1.5 text-imperium-steel hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Hammer className="h-16 w-16 text-imperium-steel-dark mx-auto mb-4 opacity-50" />
            <p className="font-terminal text-imperium-steel mb-4">[NO_BLUEPRINTS_FOUND]</p>
            <motion.button
              onMouseEnter={playHover}
              onClick={() => setView('create-project')}
              className="inline-flex items-center gap-2 px-4 py-2 font-display text-sm uppercase tracking-wider border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Blueprint
            </motion.button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="CONFIRM DELETION"
        description={`You are about to destroy "${deleteDialog.title}" from the forge. This action cannot be undone.`}
        confirmLabel="DESTROY"
        cancelLabel="ABORT"
        variant="danger"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        isSuccess={deleteSuccess}
      />
    </>
  );
}
