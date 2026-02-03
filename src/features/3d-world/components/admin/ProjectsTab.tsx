'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Star, Globe, Hammer, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '@/features/portfolio/queries/useProjects';
import { useDeleteProject } from './queries/use-project-mutations';
import { useInWorldAdminStore } from '@/features/admin/store';
import { ConfirmDialog } from './ConfirmDialog';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';
import { exportProjects, importProjects } from '@/actions/projects-export-import';
import { MAX_IMPORT_SIZE } from '@/actions/projects-export-import.config';
import { useQueryClient } from '@tanstack/react-query';

type ImportResult = { imported: number; skipped: number; errors: string[] };

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
  const queryClient = useQueryClient();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: '',
    title: '',
  });
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [worldFilter, setWorldFilter] = useState<WorldFilter>('all');
  const [importDialog, setImportDialog] = useState<{ open: boolean; result: ImportResult | null }>({
    open: false,
    result: null,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportProjects();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    playClick();
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > MAX_IMPORT_SIZE) {
      alert(`File too large. Maximum size is ${Math.round(MAX_IMPORT_SIZE / 1024 / 1024)}MB.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      // Show confirm dialog with import options
      const shouldSkipExisting = confirm('Skip existing projects? Click OK to skip, Cancel to overwrite.');
      const result = await importProjects(rawData, {
        skipExisting: shouldSkipExisting,
        overwrite: !shouldSkipExisting,
      });

      setImportDialog({ open: true, result });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error && error.message.includes('AuthorizationError')
        ? 'You do not have permission to import'
        : `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      alert(errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          <div className="flex items-center gap-2">
            <motion.button
              onMouseEnter={playHover}
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 font-terminal text-xs uppercase tracking-wider border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-gold hover:text-imperium-gold transition-all disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </motion.button>
            <motion.button
              onMouseEnter={playHover}
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-2 px-3 py-2 font-terminal text-xs uppercase tracking-wider border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-teal hover:text-imperium-teal transition-all disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Import
            </motion.button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
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
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        unoptimized
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

      <ConfirmDialog
        open={importDialog.open}
        onOpenChange={(open) => setImportDialog({ ...importDialog, open, result: null })}
        title="IMPORT COMPLETE"
        description={
          importDialog.result
            ? `Imported: ${importDialog.result.imported} | Skipped: ${importDialog.result.skipped}${
                importDialog.result.errors.length > 0
                  ? ` | Errors: ${importDialog.result.errors.length}`
                  : ''
              }`
            : ''
        }
        confirmLabel="CLOSE"
        cancelLabel={undefined}
        variant="success"
        onConfirm={() => setImportDialog({ open: false, result: null })}
        isLoading={false}
        isSuccess={true}
      />
    </>
  );
}
