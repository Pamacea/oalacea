import { BlogPostPageClient } from '@/features/blog/components/BlogPostPageClient'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  return <BlogPostPageClient slug={slug} />
}
