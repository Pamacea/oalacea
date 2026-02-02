import { BlogPostPageClient } from '@/features/blog/components/BlogPostPageClient'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Pure client-side rendering to avoid server-side DB connection issues in serverless
export default function BlogPostPage({ params }: BlogPostPageProps) {
  // We need to await params in Next.js 15, but we don't use the slug directly
  // The client component will handle fetching via the URL
  return <BlogPostPageClient />
}
