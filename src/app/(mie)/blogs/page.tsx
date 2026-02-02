import { BlogsPageClient } from '@/features/blog/components/BlogsPageClient'
import { blogPageMetadata } from '@/shared/components/seo/BlogPageMetadata'

export const metadata = blogPageMetadata()

// Pure client-side rendering to avoid server-side DB connection issues in serverless
export default function BlogsPage() {
  return <BlogsPageClient />
}
