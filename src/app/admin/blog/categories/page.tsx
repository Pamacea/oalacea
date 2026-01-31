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
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">Catégories</h1>
            <p className="text-zinc-500 text-sm mt-1">{categories.length} catégorie{categories.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={handleAddDefault}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-300 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? 'Ajout...' : 'Ajouter les défauts'}
          </button>
        </div>

        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nouvelle catégorie..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </form>

        {categories.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center">
            <Folder className="h-10 w-10 mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm mb-4">Aucune catégorie</p>
            <button
              onClick={handleAddDefault}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Créer les catégories par défaut
            </button>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-900/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-zinc-200">{cat.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">/{cat.slug} · {cat.postCount} article{cat.postCount !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() =>
                    setDeleteDialog({ open: true, id: cat.id, name: cat.name, postCount: cat.postCount })
                  }
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
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
        title="Supprimer la catégorie ?"
        description={
          deleteDialog.postCount > 0
            ? `La catégorie « ${deleteDialog.name} » contient ${deleteDialog.postCount} article${deleteDialog.postCount > 1 ? 's' : ''}. Cette action est irréversible.`
            : `Êtes-vous sûr de vouloir supprimer « ${deleteDialog.name} » ?`
        }
        confirmLabel="Supprimer"
        onConfirm={handleDeleteConfirm}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
