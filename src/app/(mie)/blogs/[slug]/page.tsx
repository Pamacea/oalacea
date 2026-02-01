import { notFound } from "next/navigation"
import { getPostBySlug } from "@/actions/blog"
import { Comments } from "@/features/blog/components/Comments"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Force dynamic rendering - don't attempt to prerender at build time
export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <div className="container py-12">
      <article className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <span className="inline-block px-3 py-1 font-terminal text-xs font-semibold rounded-none border-2 border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson mb-4">
              {post.category.name}
            </span>
          )}
          <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-imperium-bone">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 font-terminal text-lg text-imperium-steel">
              {post.excerpt}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4 font-terminal text-sm text-imperium-steel-dark">
            {post.publishDate && (
              <time dateTime={new Date(post.publishDate).toISOString()}>
                <span className="text-imperium-gold">{'>'}</span> {new Date(post.publishDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            )}
            {post.readingTime && (
              <span>{post.readingTime} min de lecture</span>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-none border-2 border-imperium-steel-dark">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none [&>h1]:font-display [&>h1]:uppercase [&>h1]:text-imperium-crimson [&>h1]:tracking-wider [&>h1]:text-2xl [&>h1]:sm:[&>h1]:text-3xl [&>h2]:font-display [&>h2]:uppercase [&>h2]:tracking-wider [&>h2]:text-imperium-gold [&>h2]:text-xl [&>h2]:sm:[&>h2]:text-2xl [&>strong]:font-display [&>strong]:uppercase [&>strong]:text-imperium-bone [&>a]:text-imperium-crimson [&>a]:hover:text-imperium-gold [&>a]:border-b-2 [&>a]:border-imperium-steel-dark [&>a]:border-dashed [&>a]:pb-0.5 [&>code]:bg-imperium-crimson/10 [&>code]:text-imperium-crimson [&>code]:border [&>code]:border-imperium-crimson/30 [&>code]:rounded-none [&>blockquote]:border-l-4 [&>blockquote]:border-imperium-gold [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:font-terminal [&>blockquote]:text-imperium-steel [&>hr]:border-imperium-steel-dark [&>hr]:my-6 [&>hr]:border-t-2 [&>hr]:border-dashed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t-2 border-imperium-steel-dark">
            <h3 className="font-display uppercase tracking-wider text-imperium-gold mb-3">{'>'} Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 font-terminal text-sm rounded-none border-2 border-imperium-steel bg-imperium-iron text-imperium-steel"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="mt-12 pt-8 border-t-2 border-imperium-steel-dark">
          <Comments postId={post.id} />
        </div>
      </article>
    </div>
  )
}
