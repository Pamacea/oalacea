'use client';

import { useState } from 'react';
import { Plus, Trash2, Folder } from 'lucide-react';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/features/blog/queries';
import { ConfirmDialog } from '@/features/3d-world/components/admin/ConfirmDialog';

const DEFAULT_CATEGORIES = [
  { name: 'Développement', slug: 'developpement' },
  { name: 'Design', slug: 'design' },
  { name: 'Tutoriels', slug: 'tutoriels' },
  { name: 'Projets', slug: 'projets' },
  { name: 'À propos', slug: 'a-propos' },
];

export default function AdminCategoriesPage() {
  const { categories, isLoading } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string; postCount: number }>({
    open: false,
    id: '',
    name: '',
    postCount: 0,
  });

  const createMutation = useCreateCategory();
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
      if (!categories.find(c => c.slug === cat.slug)) {
        createMutation.mutate(cat);
      }
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const slug = generateSlug(newCategoryName);
    if (categories.find(c => c.slug === slug)) {
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
      <div className="flex items-center justify-center py-20">
        <div className="font-terminal text-imperium-steel">{'>'} Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wider text-imperium-crimson">
              [ Categories ]
            </h1>
            <p className="font-terminal text-imperium-steel-dark text-sm mt-1">
              {'>'} {categories.length} catégorie{categories.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleAddDefault}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black rounded-none hover:border-imperium-gold hover:text-imperium-gold transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? 'Adding...' : 'Add defaults'}
          </button>
        </div>

        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category..."
            className="flex-1 rounded-none border-2 border-imperium-steel-dark bg-imperium-black px-4 py-2 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-crimson"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-bone border-2 border-imperium-steel bg-imperium-iron rounded-none hover:border-imperium-crimson hover:bg-imperium-crimson/10 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>

        {categories.length === 0 ? (
          <div className="border-2 border-dashed border-imperium-steel-dark rounded-none p-12 text-center">
            <Folder className="h-10 w-10 mx-auto text-imperium-steel-dark mb-3" />
            <p className="font-terminal text-imperium-steel-dark text-sm mb-4">{'>'} No categories</p>
            <button
              onClick={handleAddDefault}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black rounded-none hover:border-imperium-gold hover:bg-imperium-gold/10 transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create defaults
            </button>
          </div>
        ) : (
          <div className="border-2 border-imperium-steel-dark rounded-none divide-y divide-imperium-steel-dark">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-imperium-iron transition-colors"
              >
                <div>
                  <p className="font-display text-sm uppercase tracking-wider text-imperium-bone">{cat.name}</p>
                  <p className="font-terminal text-xs text-imperium-steel-dark">
                    /{cat.slug} {'>'} {cat.postCount} article{cat.postCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setDeleteDialog({ open: true, id: cat.id, name: cat.name, postCount: cat.postCount })
                  }
                  className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete category?"
        description={
          deleteDialog.postCount > 0
            ? `The category "${deleteDialog.name}" contains ${deleteDialog.postCount} article${deleteDialog.postCount > 1 ? 's' : ''}. This action is irreversible.`
            : `Are you sure you want to delete "${deleteDialog.name}"?`
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
