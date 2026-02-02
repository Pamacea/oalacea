import { getPostsForServer } from '@/actions/blog/server'
import { BlogsPageClient } from '@/features/blog/components/BlogsPageClient'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const initialData = await getPostsForServer({ published: true, limit: 100 })
  return <BlogsPageClient initialData={initialData} />
}
