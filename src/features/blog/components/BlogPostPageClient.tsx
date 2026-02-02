'use client'

import { notFound } from 'next/navigation'
import { useBlogPost } from '../hooks'
import { BlogPostTemplate } from './BlogPostTemplate'

interface BlogPostPageClientProps {
  slug: string
}

export function BlogPostPageClient({ slug }: BlogPostPageClientProps) {
  const { data: post, isLoading } = useBlogPost(slug)

  if (isLoading) {
    return (
      <div className="w-full max-w-[80%] mx-auto px-4 py-12 text-center">
        <p className="font-terminal text-imperium-steel">Loading archive...</p>
      </div>
    )
  }

  if (!post || !post.published) {
    notFound()
  }

  return (
    <article className="w-full max-w-[80%] mx-auto">
      <BlogPostTemplate post={post} variant="page" />
    </article>
  )
}
