import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { getPosts, deletePostWithRevalidate } from '@/actions/blog';

function DeleteButton({ slug }: { slug: string }) {
  return (
    <form action={deletePostWithRevalidate.bind(null, slug)}>
      <button
        type="submit"
        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export const revalidate = 30;

export default async function AdminBlogPage() {
  const posts = await getPosts({ published: false });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Blog</h1>
          <p className="text-zinc-500 text-sm mt-1">{posts.pagination.total} article{posts.pagination.total > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Link>
      </div>

      {/* Posts List */}
      {posts.posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500 mb-4">Aucun article</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
          >
            <Plus className="h-4 w-4" />
            Créer le premier
          </Link>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {posts.posts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {post.coverImage && (
                        <div className="h-12 w-16 rounded overflow-hidden bg-zinc-900 shrink-0">
                          <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-200">{post.title}</p>
                        <p className="text-xs text-zinc-500">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton slug={post.slug} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
