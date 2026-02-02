import { getPosts } from '@/actions/blog'
import { BlogsPageClient } from '@/features/blog/components/BlogsPageClient'

export default async function BlogsPage() {
  const initialData = await getPosts({ published: true, limit: 100 })
  return <BlogsPageClient initialData={initialData} />
}
