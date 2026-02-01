'use client';

import { useState } from 'react';
import { Plus, Trash2, Folder, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/features/blog/queries';
import { ConfirmDialog } from './ConfirmDialog';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';

const DEFAULT_CATEGORIES = [
  { name: 'Développement', slug: 'developpement' },
  { name: 'Design', slug: 'design' },
  { name: 'Tutoriels', slug: 'tutoriels' },
  { name: 'Projets', slug: 'projets' },
  { name: 'À propos', slug: 'a-propos' },
];

export function CategoriesTab() {
  const { categories, isLoading } = useCategories({ type: 'BLOG', uncached: true });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string; postCount: number }>({
    open: false,
    id: '',
    name: '',
    postCount: 0,
  });
  const { playHover, playClick } = useUISound();

  const createMutation = useCreateCategory('BLOG');
  const deleteMutation = useDeleteCategory();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAddDefault = async () => {
    for (const cat of DEFAULT_CATEGORIES) {
      if (!categories.find((c) => c.slug === cat.slug)) {
        createMutation.mutate(cat);
      }
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const slug = generateSlug(newCategoryName);
    if (categories.find((c) => c.slug === slug)) {
      alert('Cette catégorie existe déjà');
      return;
    }

    createMutation.mutate({ name: newCategoryName, slug });
    setNewCategoryName('');
  };

  const handleDeleteConfirm = async () => {
    deleteMutation.mutate(deleteDialog.id, {
      onSuccess: () => {
        setDeleteDialog({ ...deleteDialog, open: false });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 border-2 border-imperium-steel-dark bg-imperium-black/30 animate-pulse max-w-xs" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 border-2 border-imperium-steel-dark bg-imperium-black/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wider text-imperium-bone">
              <GlitchText intensity="medium" auto>
                Index System
              </GlitchText>
            </h2>
            <p className="font-terminal text-xs text-imperium-steel mt-1">
              {'>'} {categories.length} index entr{categories.length > 1 ? 'ies' : 'ie'} available
            </p>
          </div>
          <motion.button
            onMouseEnter={playHover}
            onClick={handleAddDefault}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 font-display text-sm uppercase tracking-wider border-2 border-imperium-steel-dark bg-imperium-black/30 text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? 'INITIALIZING...' : 'LOAD DEFAULTS'}
          </motion.button>
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter new index designation..."
            className="flex-1 border-2 border-imperium-steel-dark bg-imperium-black px-4 py-2 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-crimson"
          />
          <motion.button
            type="submit"
            onMouseEnter={playHover}
            disabled={createMutation.isPending || !newCategoryName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 font-display text-sm uppercase tracking-wider border-2 border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-bone transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            CREATE
          </motion.button>
        </form>

        {/* Categories list */}
        {categories.length === 0 ? (
          <div className="border-2 border-dashed border-imperium-steel-dark p-12 text-center">
            <Folder className="h-12 w-12 text-imperium-steel-dark mx-auto mb-4 opacity-50" />
            <p className="font-terminal text-imperium-steel text-sm mb-4">[NO_INDEX_FOUND]</p>
            <motion.button
              onMouseEnter={playHover}
              onClick={handleAddDefault}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson transition-all"
            >
              <Plus className="h-4 w-4" />
              Initialize Index
            </motion.button>
          </div>
        ) : (
          <div className="border-2 border-imperium-steel-dark divide-y divide-imperium-steel-dark">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-imperium-crimson/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="border-2 border-imperium-steel-dark bg-imperium-black/30 p-2 group-hover:border-imperium-crimson transition-colors">
                    <FolderOpen className="h-4 w-4 text-imperium-steel group-hover:text-imperium-crimson" />
                  </div>
                  <div>
                    <p className="font-display text-sm text-imperium-bone">{cat.name}</p>
                    <p className="font-terminal text-xs text-imperium-steel-dark">
                      /{cat.slug} · {cat.postCount} archive{cat.postCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <motion.button
                  onMouseEnter={playHover}
                  onClick={() =>
                    setDeleteDialog({ open: true, id: cat.id, name: cat.name, postCount: cat.postCount })
                  }
                  aria-label={`Delete ${cat.name}`}
                  className="p-2 text-imperium-steel hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="CONFIRM DELETION"
        description={
          deleteDialog.postCount > 0
            ? `The index "${deleteDialog.name}" contains ${deleteDialog.postCount} archive${deleteDialog.postCount > 1 ? 's' : ''}. Purging will orphan these entries.`
            : `You are about to purge "${deleteDialog.name}" from the index. This action cannot be undone.`
        }
        confirmLabel="PURGE"
        cancelLabel="ABORT"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
