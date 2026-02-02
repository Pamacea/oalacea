import { BlogPostPageClient } from '@/features/blog/components/BlogPostPageClient'
import { getPostBySlugUncached } from '@/actions/blog/query'
import { ArticleSchema } from '@/shared/components/seo'
import { siteConfig } from '@/config/site'
import type { Metadata } from 'next'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlugUncached(slug)

  if (!post || !post.published) {
    return {
      title: 'Article non trouvé',
    }
  }

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || siteConfig.description
  const image = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${siteConfig.url}${post.coverImage}`
    : `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${siteConfig.url}/blog/${slug}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: post.publishDate?.toISOString() || post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags || undefined,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: siteConfig.seo.twitterCreator,
    },
    alternates: {
      canonical: `${siteConfig.url}/blog/${slug}`,
    },
  }
}

// Server component that passes initial data to client
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const initialPost = await getPostBySlugUncached(slug)

  if (!initialPost || !initialPost.published) {
    return (
      <div className="w-full max-w-[80%] mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Article non trouvé</h1>
        <p className="mt-4 text-slate-500">Cet article n'existe pas ou n'est pas disponible.</p>
      </div>
    )
  }

  const imageUrl = initialPost.coverImage
    ? initialPost.coverImage.startsWith('http')
      ? initialPost.coverImage
      : `${siteConfig.url}${initialPost.coverImage}`
    : `${siteConfig.url}${siteConfig.ogImage}`

  return (
    <>
      <ArticleSchema
        title={initialPost.title}
        description={initialPost.excerpt || undefined}
        image={imageUrl}
        datePublished={initialPost.publishDate?.toISOString() || initialPost.createdAt.toISOString()}
        dateModified={initialPost.updatedAt.toISOString()}
        category={initialPost.category?.name}
        tags={initialPost.tags || undefined}
      />
      <BlogPostPageClient initialPost={initialPost} />
    </>
  )
}
