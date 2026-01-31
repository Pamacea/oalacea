import { getPosts } from "@/actions/blog"
import type { PostListItem } from "@/actions/blog"
import Link from "next/link"
import { Calendar, Clock } from "lucide-react"

export default async function BlogsPage() {
  const { posts } = await getPosts({ published: true })

  if (posts.length === 0) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Blog
          </h1>
          <p className="mt-4 text-muted-foreground">
            Aucun article disponible pour le moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Blog
        </h1>
        <p className="mt-4 text-muted-foreground">
          Découvrez mes derniers articles sur le développement web, le design et plus encore.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="group relative overflow-hidden rounded-xl transition-all border border-border bg-card hover:border-primary/50">
      {/* Cover Image */}
      {post.coverImage && (
        <Link href={`/blogs/${post.slug}`}>
          <div className="aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Category Badge */}
        {post.category && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-primary/10 text-primary">
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h2 className="mt-3 text-lg sm:text-xl font-bold">
          <Link
            href={`/blogs/${post.slug}`}
            className="hover:underline hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.publishDate ?? post.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime || 5} min
          </span>
        </div>

        {/* Read More Link */}
        <Link
          href={`/blogs/${post.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Lire la suite
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Featured Indicator */}
      {post.featured && (
        <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full shadow-lg bg-primary text-primary-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      )}
    </article>
  )
}
