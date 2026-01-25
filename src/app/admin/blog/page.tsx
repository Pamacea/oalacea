import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { getPosts, getAllCategories } from '@/actions/blog';
import { deletePost } from '@/actions/blog';
import { revalidatePath } from 'next/cache';

function DeleteButton({ slug }: { slug: string }) {
  async function handleDelete() {
    'use server';
    await deletePost(slug);
    revalidatePath('/admin/blog');
  }

  return (
    <form action={handleDelete}>
      <button
        type="submit"
        className="rounded p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([
    getPosts({ published: false }),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog</h1>
          <p className="text-slate-400">
            {posts.pagination.total} article{posts.pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-slate-900/50">
            <tr className="text-left text-sm">
              <th className="px-6 py-4 font-medium text-slate-400">Titre</th>
              <th className="px-6 py-4 font-medium text-slate-400">Catégorie</th>
              <th className="px-6 py-4 font-medium text-slate-400">Statut</th>
              <th className="px-6 py-4 font-medium text-slate-400">Date</th>
              <th className="px-6 py-4 font-medium text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Aucun article. Créez votre premier article !
                </td>
              </tr>
            ) : (
              posts.posts.map((post) => (
                <tr
                  key={post.id}
                  className="group bg-slate-900/30 transition-colors hover:bg-slate-900/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{post.title}</p>
                    <p className="text-sm text-slate-500">{post.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    {post.category ? (
                      <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
                        <Eye className="h-3.5 w-3.5" />
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <EyeOff className="h-3.5 w-3.5" />
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="rounded p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="rounded p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton slug={post.slug} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {posts.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: posts.pagination.totalPages }, (_, i) => (
            <Link
              key={i}
              href={`/admin/blog?page=${i + 1}`}
              className={`rounded px-3 py-1.5 text-sm ${
                posts.pagination.page === i + 1
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
