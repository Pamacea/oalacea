import { notFound } from "next/navigation"
import { getPostBySlug } from "@/actions/blog"
import { BlogPostTemplate } from "@/features/blog/components/BlogPostTemplate"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <article className="w-full max-w-[80%] mx-auto">
      <BlogPostTemplate post={post} variant="page" />
    </article>
  )
}
