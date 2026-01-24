import type { PostListItem } from "@/types"
import { formatDate } from "@/lib/formatters"
import { Card } from "@/components/ui/card"

interface PostCardProps {
  post: PostListItem
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">{post.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatDate(post.createdAt)}
      </p>
      {post.excerpt && (
        <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
      )}
    </Card>
  )
}
