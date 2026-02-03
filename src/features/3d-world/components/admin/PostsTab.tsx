'use client';

import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, Scroll, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePosts, useDeletePost } from '@/features/blog/queries';
import { useInWorldAdminStore } from '@/features/admin/store';
import { ConfirmDialog } from './ConfirmDialog';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';
import { exportBlogs, importBlogs } from '@/actions/blog/export-import';
import { MAX_IMPORT_SIZE } from '@/actions/blog/export-import.config';
import { useQueryClient } from '@tanstack/react-query';

type ImportResult = { imported: number; skipped: number; errors: string[] };

export function PostsTab() {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; slug: string; title: string }>({
    open: false,
    slug: '',
    title: '',
  });
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [importDialog, setImportDialog] = useState<{ open: boolean; result: ImportResult | null }>({
    open: false,
    result: null,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setView, setSelectedId } = useInWorldAdminStore();
  const { playHover, playClick } = useUISound();
  const queryClient = useQueryClient();

  const { posts, isLoading } = usePosts({ published: false, page: 1, limit: 100 });
  const deleteMutation = useDeletePost();

  const handleDelete = () => {
    deleteMutation.mutate(deleteDialog.slug, {
      onSuccess: () => {
        setDeleteSuccess(true);
        setTimeout(() => {
          setDeleteDialog({ open: false, slug: '', title: '' });
          setDeleteSuccess(false);
        }, 1000);
      },
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportBlogs();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blogs-export-${new Date().toISOString().split('T')[0]}.json`;
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
      const shouldSkipExisting = confirm('Skip existing posts? Click OK to skip, Cancel to overwrite.');
      const result = await importBlogs(rawData, {
        skipExisting: shouldSkipExisting,
        overwrite: !shouldSkipExisting,
      });

      setImportDialog({ open: true, result });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 border-imperium-steel-dark bg-imperium-black/30 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
          <h2 className="font-display text-2xl uppercase tracking-wider text-imperium-bone">
            <GlitchText intensity="medium">
              Archives Database
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
                setSelectedId(null);
                setView('edit-post');
                playClick();
              }}
              className="flex items-center gap-2 px-4 py-2 font-display text-sm uppercase tracking-wider border-2 border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-bone transition-all"
            >
              <Plus className="h-4 w-4" />
              New Entry
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

        {posts.length === 0 ? (
          <div className="border-2 border-dashed border-imperium-steel-dark p-12 text-center">
            <Scroll className="h-12 w-12 text-imperium-steel-dark mx-auto mb-4 opacity-50" />
            <p className="font-terminal text-imperium-steel text-sm mb-4">[NO_ARCHIVES_FOUND]</p>
            <motion.button
              onMouseEnter={playHover}
              onClick={() => {
                setSelectedId(null);
                setView('edit-post');
                playClick();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson transition-all"
            >
              <Plus className="h-4 w-4" />
              Create First Entry
            </motion.button>
          </div>
        ) : (
          <div className="border-2 border-imperium-steel-dark overflow-hidden">
            <table className="w-full">
              <thead className="border-b-2 border-imperium-steel-dark bg-imperium-black-deep/50">
                <tr className="text-left">
                  <th className="px-4 py-4 font-terminal text-xs uppercase tracking-wider text-imperium-steel">
                    Title
                  </th>
                  <th className="px-4 py-4 font-terminal text-xs uppercase tracking-wider text-imperium-steel">
                    Status
                  </th>
                  <th className="px-4 py-4 font-terminal text-xs uppercase tracking-wider text-right text-imperium-steel">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-imperium-steel-dark">
                {posts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-imperium-crimson/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="font-display text-sm text-imperium-bone">{post.title}</p>
                      <p className="font-terminal text-xs text-imperium-steel-dark">/{post.slug}</p>
                    </td>
                    <td className="px-4 py-4">
                      {post.published ? (
                        <span className="inline-flex items-center gap-1.5 font-terminal text-xs text-imperium-crimson border border-imperium-crimson bg-imperium-crimson/10 px-2 py-1">
                          <Eye className="h-3.5 w-3.5" />
                          [PUBLISHED]
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-terminal text-xs text-imperium-steel border border-imperium-steel-dark px-2 py-1">
                          <EyeOff className="h-3.5 w-3.5" />
                          [DRAFT]
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.published && (
                          <motion.button
                            onMouseEnter={playHover}
                            onClick={() => {
                              setSelectedId(post.slug);
                              setView('read-post');
                              playClick();
                            }}
                            aria-label={`Read ${post.title}`}
                            className="p-2 text-imperium-steel hover:text-imperium-gold hover:bg-imperium-gold/10 border border-transparent hover:border-imperium-gold/30 rounded transition-all"
                          >
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                          </motion.button>
                        )}
                        <motion.button
                          onMouseEnter={playHover}
                          onClick={() => {
                            setSelectedId(post.slug);
                            setView('edit-post');
                            playClick();
                          }}
                          aria-label={`Edit ${post.title}`}
                          className="p-2 text-imperium-steel hover:text-imperium-crimson hover:bg-imperium-crimson/10 border border-transparent hover:border-imperium-crimson/30 rounded transition-all"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </motion.button>
                        <motion.button
                          onMouseEnter={playHover}
                          onClick={() =>
                            setDeleteDialog({ open: true, slug: post.slug, title: post.title })
                          }
                          aria-label={`Delete ${post.title}`}
                          className="p-2 text-imperium-steel hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded transition-all"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="CONFIRM DELETION"
        description={`You are about to purge "${deleteDialog.title}" from the archives. This action cannot be undone.`}
        confirmLabel="PURGE"
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
