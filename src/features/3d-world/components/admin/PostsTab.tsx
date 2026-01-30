'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { getPosts, deletePost, type PostListItem } from '@/actions/blog';
import { useInWorldAdminStore } from '@/features/admin/store';
import { ConfirmDialog } from './ConfirmDialog';
import { TableSkeleton } from '@/features/admin/components';

export function PostsTab() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; slug: string; title: string }>({
    open: false,
    slug: '',
    title: '',
  });
  const { setView } = useInWorldAdminStore();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const result = await getPosts({});
      setPosts(result.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    await deletePost(deleteDialog.slug);
    setDeleteDialog({ open: false, slug: '', title: '' });
    fetchPosts();
  };

  if (isLoading) {
    return <TableSkeleton rows={5} columns={3} />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">Blog</h2>
          <button
            onClick={() => setView('edit-post')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nouvel article
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center">
            <p className="text-zinc-500 text-sm mb-4">Aucun article</p>
            <button
              onClick={() => setView('edit-post')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
            >
              <Plus className="h-4 w-4" />
              Créer le premier
            </button>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Titre</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-zinc-900/30 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-200 text-sm">{post.title}</p>
                      <p className="text-xs text-zinc-500">{post.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      {post.published ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <Eye className="h-3.5 w-3.5" />
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                          <EyeOff className="h-3.5 w-3.5" />
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.published && (
                          <button
                            onClick={() => setView('read-post')}
                            aria-label={`Read ${post.title}`}
                            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all duration-200"
                          >
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          onClick={() => setView('edit-post')}
                          aria-label={`Edit ${post.title}`}
                          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all duration-200"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({ open: true, slug: post.slug, title: post.title })
                          }
                          aria-label={`Delete ${post.title}`}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Supprimer l'article ?"
        description={`Êtes-vous sûr de vouloir supprimer « ${deleteDialog.title} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="danger"
      />
    </>
  );
}
