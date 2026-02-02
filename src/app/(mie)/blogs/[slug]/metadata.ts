import type { Metadata } from "next"
import { getPostBySlugUncached } from "@/actions/blog/query"
import { createMetadata, getCanonicalUrl } from "@/lib/seo"
import { siteConfig } from "@/config/site"

interface BlogPostMetadataProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogPostMetadataProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlugUncached(slug)

  if (!post || !post.published) {
    return {
      title: "Article non trouvé",
      description: "Cet article n'existe pas ou n'est pas disponible.",
    }
  }

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || siteConfig.description
  const image = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `${siteConfig.url}${post.coverImage}`
    : `${siteConfig.url}${siteConfig.ogImage}`

  return createMetadata({
    title,
    description,
    image,
    type: "article",
    publishedTime: post.publishDate?.toISOString() || post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    tags: post.tags || undefined,
    canonical: getCanonicalUrl(`/blog/${slug}`),
  })
}
