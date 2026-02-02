'use client'

import { notFound } from 'next/navigation'
import { useBlogPost } from '../hooks'
import { BlogPostTemplate } from './BlogPostTemplate'
import type { PostDetail } from '@/actions/blog/query'

interface BlogPostPageClientProps {
  slug: string
  initialPost?: PostDetail | null
}

export function BlogPostPageClient({ slug, initialPost }: BlogPostPageClientProps) {
  const { data: post, isLoading } = useBlogPost(slug, initialPost)

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
