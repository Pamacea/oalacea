import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Eye, Folder, Skull } from 'lucide-react';
import { getPosts, deletePostWithRevalidate } from '@/actions/blog';
import { GlitchText } from '@/components/ui/imperium';

function DeleteButton({ slug }: { slug: string }) {
  return (
    <form action={deletePostWithRevalidate.bind(null, slug)}>
      <button
        type="submit"
        className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors border-2 border-transparent hover:border-imperium-maroon"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await getPosts({ published: false });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
        <Skull className="w-full h-full text-imperium-crimson" />
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-imperium-steel-dark">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-widest text-imperium-crimson flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-imperium-crimson animate-pulse" />
            <GlitchText intensity="medium">[ ARCHIVES DATABASE ]</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel text-sm mt-2 flex items-center gap-2">
            <span className="text-imperium-gold">{'>'}</span>
            <span>{posts.pagination.total} ENTR{posts.pagination.total > 1 ? 'IES' : 'Y'} DETECTED</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/blog/categories"
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black-deep hover:border-imperium-gold hover:text-imperium-gold hover:shadow-[4px_4px_0_rgba(212,175,55,0.2)] transition-all"
          >
            <Folder className="h-4 w-4" />
            <span className="hidden sm:inline">INDEX</span>
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-bone border-2 border-imperium-crimson bg-imperium-crimson hover:bg-imperium-crimson/90 hover:shadow-[4px_4px_0_rgba(154,17,21,0.4)] transition-all"
          >
            <Plus className="h-4 w-4" />
            NEW ENTRY
          </Link>
        </div>
      </div>

      {posts.posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-imperium-steel-dark bg-imperium-black-deep/30">
          <p className="font-terminal text-imperium-steel-dark mb-4">{'>'} NO ARCHIVES FOUND</p>
          <p className="font-terminal text-xs text-imperium-steel mb-6">Database empty. Initialize new entry.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-6 py-3 font-terminal text-sm text-imperium-bone border-2 border-imperium-crimson bg-imperium-crimson hover:bg-imperium-crimson/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            INITIALIZE
          </Link>
        </div>
      ) : (
        <div className="border-2 border-imperium-steel-dark bg-imperium-black-deep/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-imperium-black border-b-2 border-imperium-steel-dark">
                <tr>
                  <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Entry ]</th>
                  <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Status ]</th>
                  <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Date ]</th>
                  <th className="px-6 py-4 text-right font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Actions ]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-imperium-steel-dark">
                {posts.posts.map((post) => (
                  <tr key={post.id} className="hover:bg-imperium-crimson/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {post.coverImage && (
                          <div className="h-12 w-16 overflow-hidden border-2 border-imperium-steel-dark bg-imperium-black shrink-0 group-hover:border-imperium-crimson transition-colors">
                            <Image src={post.coverImage} alt="" width={64} height={48} className="h-full w-full object-cover" unoptimized />
                          </div>
                        )}
                        <div>
                          <p className="font-display text-sm uppercase text-imperium-bone group-hover:text-imperium-crimson transition-colors">{post.title}</p>
                          <p className="font-terminal text-xs text-imperium-steel-dark">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.published ? (
                        <span className="inline-flex items-center px-2 py-1 font-terminal text-xs font-semibold border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold">
                          [PUBLISHED]
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 font-terminal text-xs font-semibold border-2 border-imperium-steel bg-imperium-steel text-imperium-steel-dark">
                          [DRAFT]
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-terminal text-sm text-imperium-steel-dark">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-imperium-steel hover:text-imperium-crimson border-2 border-transparent hover:border-imperium-crimson/30 transition-all"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="p-2 text-imperium-steel hover:text-imperium-gold border-2 border-transparent hover:border-imperium-gold/30 transition-all"
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
        </div>
      )}
    </div>
  );
}
