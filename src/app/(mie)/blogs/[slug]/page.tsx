import { BlogPostPageClient } from '@/features/blog/components/BlogPostPageClient'
import { getPostBySlugForServer } from '@/actions/blog/server'
import { notFound } from 'next/navigation'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlugForServer(slug)

  if (!post || !post.published) {
    notFound()
  }

  return <BlogPostPageClient slug={slug} initialPost={post} />
}
