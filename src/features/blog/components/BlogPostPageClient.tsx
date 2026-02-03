'use client'

import { notFound } from 'next/navigation'
import { usePost } from '@/features/blog/queries'
import { BlogPostTemplate } from './BlogPostTemplate'
import { useParams } from 'next/navigation'
import type { PostDetail } from '@/actions/blog/query'
import type { Comment } from '@/generated/prisma/client'

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]
}

interface BlogPostPageClientProps {
  initialPost?: PostDetail | null
  initialComments?: CommentWithReplies[]
  commentsCount?: number
}

export function BlogPostPageClient({ initialPost, initialComments = [], commentsCount = 0 }: BlogPostPageClientProps = {}) {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0] || ''

  const { post, isLoading } = usePost(slug)

  // Use initialData if provided (for SSR)
  const displayPost = initialPost ?? post

  if (isLoading) {
    return (
      <div className="w-full max-w-[80%] mx-auto px-4 py-12 text-center">
        <p className="font-terminal text-imperium-steel">Loading archive...</p>
      </div>
    )
  }

  if (!displayPost || !displayPost.published) {
    notFound()
  }

  return (
    <article className="w-full max-w-[80%] mx-auto">
      <BlogPostTemplate
        post={displayPost}
        initialComments={initialComments}
        commentsCount={commentsCount}
        variant="page"
      />
    </article>
  )
}
