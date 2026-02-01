'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, Scroll } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePosts, useDeletePost } from '@/features/blog/queries';
import { useInWorldAdminStore } from '@/features/admin/store';
import { ConfirmDialog } from './ConfirmDialog';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

export function PostsTab() {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; slug: string; title: string }>({
    open: false,
    slug: '',
    title: '',
  });
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { setView, setSelectedId } = useInWorldAdminStore();
  const { playHover, playClick } = useUISound();

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
            <GlitchText intensity="medium" auto>
              Archives Database
            </GlitchText>
          </h2>
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
    </>
  );
}
