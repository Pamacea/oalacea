import { getPosts } from '@/actions/blog';

export const dynamic = 'force-static';
export const revalidate = 300; // Revalidate every 5 minutes

export default async function BlogPage() {
  const { posts } = await getPosts({ published: true });

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Blog Posts Grid - 2 columns, no header section */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
              >
                {/* Cover Image */}
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden border-b border-zinc-800">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h2 className="text-lg font-semibold text-zinc-100 mb-2 line-clamp-2">
                    <a href={`/blog/${post.slug}`} className="hover:text-zinc-300 transition-colors">
                      {post.title}
                    </a>
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                    <span>
                      {new Date(post.publishDate ?? post.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span>{post.readingTime || 5} min</span>
                  </div>

                  {/* Category */}
                  {post.category && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-zinc-800 text-zinc-400">
                      {post.category.name}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
