'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Folder, Edit2, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlitchText } from '@/components/ui/imperium';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/actions/blog';
import { useForm } from '@tanstack/react-form';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'BLOG' | 'PROJECT';
  _count?: {
    posts?: number;
    projects?: number;
  };
}

interface DeleteDialog {
  open: boolean;
  id: string;
  name: string;
  count: number;
}

interface EditState {
  id: string;
  name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({ open: false, id: '', name: '', count: 0 });
  const [editState, setEditState] = useState<EditState | null>(null);
  const [, startTransition] = useTransition();

  const addCategoryForm = useForm({
    defaultValues: {
      name: '',
    },
  });

  const refreshCategories = async () => {
    const cats = await getAllCategories({ type: 'BLOG' });
    setCategories(cats);
  };

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      await refreshCategories();
      setIsLoading(false);
    };
    loadCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleStartEdit = (cat: Category) => {
    setEditState({ id: cat.id, name: cat.name });
  };

  const handleCancelEdit = () => {
    setEditState(null);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;

    try {
      await updateCategory(editState.id, { name: editState.name });
      setEditState(null);
      await refreshCategories();
    } catch {
      // Error silently ignored
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteDialog.id);
      setDeleteDialog({ ...deleteDialog, open: false });
      await refreshCategories();
    } catch {
      alert('Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-4 text-imperium-crimson"
        >
          ⚙
        </motion.div>
        <p className="font-terminal text-imperium-steel">LOADING DATA...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blog"
              className="flex items-center gap-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone px-4 py-2 transition-all"
            >
              {'<'} BACK
            </Link>
            <div>
              <h1 className="font-display text-2xl uppercase tracking-wider text-imperium-crimson flex items-center gap-3">
                <span className="inline-block w-2 h-2 bg-imperium-crimson animate-pulse" />
                <GlitchText intensity="low">[ CATEGORIES DATABASE ]</GlitchText>
              </h1>
              <p className="font-terminal text-imperium-steel text-sm mt-2 flex items-center gap-2">
                <span className="text-imperium-gold">{'>'}</span>
                <span>{categories.length} ENTR{categories.length > 1 ? 'IES' : 'Y'} FOUND</span>
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const name = addCategoryForm.state.values.name
            if (!name.trim()) return

            const slug = generateSlug(name)
            if (categories.find(c => c.slug === slug)) {
              alert('Cette catégorie existe déjà')
              return
            }

            startTransition(async () => {
              try {
                await createCategory({ name, slug, type: 'BLOG' })
                addCategoryForm.reset()
                await refreshCategories()
              } catch {
                // Error silently ignored
              }
            })
          }}
          className="flex gap-3"
        >
          <addCategoryForm.Field
            name="name"
            validators={{
              onChange: ({ value }) => value.length > 0 ? undefined : "Category name is required",
              onChangeAsync: async ({ value }) => {
                if (value.length > 50) return "Name too long"
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="flex-1">
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="NEW CATEGORY NAME..."
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-crimson"
                />
                {field.state.meta.errors && (
                  <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </addCategoryForm.Field>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 font-terminal text-sm font-medium text-imperium-bone border-2 border-imperium-crimson bg-imperium-crimson hover:bg-imperium-crimson/90 hover:shadow-[4px_4px_0_rgba(154,17,21,0.3)] transition-all"
          >
            <Plus className="h-4 w-4" />
            INITIALIZE
          </button>
        </form>

        {categories.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-imperium-steel-dark bg-imperium-black-deep/30">
            <Folder className="h-12 w-12 mx-auto text-imperium-steel-dark mb-4" />
            <p className="font-terminal text-imperium-steel-dark mb-4">{'>'} NO CATEGORIES FOUND</p>
            <p className="font-terminal text-xs text-imperium-steel mb-6">Database empty. Initialize new category.</p>
          </div>
        ) : (
          <div className="border-2 border-imperium-steel-dark bg-imperium-black-deep/20 divide-y divide-imperium-steel-dark">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-imperium-crimson/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 border-2 border-imperium-steel-dark bg-imperium-black group-hover:border-imperium-crimson transition-colors">
                    <Folder className="h-5 w-5 text-imperium-steel group-hover:text-imperium-crimson" />
                  </div>
                  {editState?.id === cat.id ? (
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSaveEdit()
                      }}
                    >
                      <input
                        type="text"
                        value={editState.name}
                        onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                        className="border-2 border-imperium-steel-dark bg-imperium-black px-3 py-1 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-crimson"
                        autoFocus
                        required
                      />
                      <button
                        type="submit"
                        className="p-1.5 border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1.5 border-2 border-imperium-maroon bg-imperium-maroon/20 text-imperium-maroon hover:bg-imperium-maroon hover:text-imperium-bone transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <div>
                      <p className="font-display text-sm uppercase tracking-wider text-imperium-bone">{cat.name}</p>
                      <p className="font-terminal text-xs text-imperium-steel-dark">
                        /{cat.slug} {'>>'} {cat._count?.posts || 0} ARCHIVE{(cat._count?.posts || 0) !== 1 ? 'S' : ''}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editState?.id !== cat.id && (
                    <>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 text-imperium-steel hover:text-imperium-gold border-2 border-transparent hover:border-imperium-gold/30 transition-all"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            id: cat.id,
                            name: cat.name,
                            count: cat._count?.posts || 0,
                          })
                        }
                        className="p-2 text-imperium-steel hover:text-imperium-crimson border-2 border-transparent hover:border-imperium-maroon/30 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-imperium-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="border-2 border-imperium-crimson bg-imperium-black max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="font-display text-lg uppercase tracking-wider text-imperium-crimson mb-4">
                [ CONFIRM DELETION ]
              </h2>
              <p className="font-terminal text-sm text-imperium-bone mb-6">
                {deleteDialog.count > 0
                  ? `WARNING: Category "${deleteDialog.name}" contains ${deleteDialog.count} archive${deleteDialog.count > 1 ? 's' : ''}. Deleting will orphan this content.`
                  : `Confirm deletion of "${deleteDialog.name}"?`}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
                  className="px-4 py-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:text-imperium-bone transition-all"
                >
                  ABORT
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 font-terminal text-sm border-2 border-imperium-crimson bg-imperium-crimson text-imperium-bone hover:bg-imperium-crimson/90 transition-all"
                >
                  TERMINATE
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
