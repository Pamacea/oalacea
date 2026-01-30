import { PostCard } from './PostCard'
import type { Post } from '@/generated/prisma/client'

interface BlogGridProps {
  posts: (Post & { category?: { name: string } | null })[]
}

export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl p-8 sm:p-12 text-center border border-dashed">
        <p className="text-muted-foreground">Aucun article disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
