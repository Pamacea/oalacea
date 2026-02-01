import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, Folder } from 'lucide-react';
import { getPosts, deletePostWithRevalidate } from '@/actions/blog';

function DeleteButton({ slug }: { slug: string }) {
  return (
    <form action={deletePostWithRevalidate.bind(null, slug)}>
      <button
        type="submit"
        className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
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
          <h1 className="font-display text-2xl uppercase tracking-wider text-imperium-crimson">
            [ Blog ]
          </h1>
          <p className="font-terminal text-imperium-steel-dark text-sm mt-1">
            {'>'} {posts.pagination.total} article{posts.pagination.total > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/blog/categories"
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black rounded-none hover:border-imperium-gold hover:text-imperium-gold transition-all"
          >
            <Folder className="h-4 w-4" />
            Categories
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-bone border-2 border-imperium-crimson bg-imperium-crimson rounded-none hover:bg-imperium-crimson/90 hover:shadow-[4px_4px_0_rgba(154,17,21,0.4)] transition-all"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>

      {/* Posts List */}
      {posts.posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-imperium-steel-dark rounded-none">
          <p className="font-terminal text-imperium-steel-dark mb-4">{'>'} No articles</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black rounded-none hover:border-imperium-gold hover:bg-imperium-gold/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create first
          </Link>
        </div>
      ) : (
        <div className="border-2 border-imperium-steel-dark rounded-none overflow-hidden">
          <table className="w-full">
            <thead className="bg-imperium-iron border-b-2 border-imperium-steel-dark">
              <tr>
                <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-imperium-steel-dark">
              {posts.posts.map((post) => (
                <tr key={post.id} className="hover:bg-imperium-iron transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {post.coverImage && (
                        <div className="h-12 w-16 rounded-none overflow-hidden border-2 border-imperium-steel-dark bg-imperium-black shrink-0">
                          <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-display text-sm uppercase text-imperium-bone">{post.title}</p>
                        <p className="font-terminal text-xs text-imperium-steel-dark">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center px-2 py-1 font-terminal text-xs font-semibold rounded-none border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 font-terminal text-xs font-semibold rounded-none border-2 border-imperium-steel bg-imperium-steel text-imperium-steel-dark">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-terminal text-sm text-imperium-steel-dark">
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
                        className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-2 text-imperium-steel hover:text-imperium-gold transition-colors"
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
