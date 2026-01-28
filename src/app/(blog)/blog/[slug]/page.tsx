import { getPostBySlug } from '@/actions/blog';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { ThemeBackground } from '@/components/shared';
import { Comments } from '@/components/blog/Comments';
import { ShareButtons } from '@/components/shared';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-static';
export const revalidate = 300; // Revalidate every 5 minutes

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article non trouvé',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishDate = new Date(post.publishDate ?? post.createdAt);

  return (
    <ThemeBackground className="min-h-screen">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline mb-8"
          style={{ color: 'var(--world-primary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-[21/9] overflow-hidden rounded-xl mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          {post.category && (
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="inline-block"
            >
              <span
                className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full mb-4"
                style={{
                  backgroundColor: 'var(--world-primary)',
                  color: 'var(--world-primary-foreground)',
                }}
              >
                {post.category.name}
              </span>
            </Link>
          )}

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'var(--world-text-primary)' }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              className="mt-4 text-lg leading-relaxed"
              style={{ color: 'var(--world-text-secondary)' }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div
            className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-sm"
            style={{ color: 'var(--world-text-muted)' }}
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {publishDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readingTime || Math.ceil(post.content.length / 1000)} min de lecture
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: 'var(--world-border)',
                    color: 'var(--world-text-secondary)',
                  }}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Share Buttons */}
        <div className="mb-8 pb-8 border-b" style={{ borderColor: 'var(--world-border)' }}>
          <ShareButtons title={post.title} />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          style={{ color: 'var(--world-text-primary)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share Buttons (Bottom) */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--world-border)' }}>
          <ShareButtons title={post.title} />
        </div>

        {/* Comments */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--world-border)' }}>
          <Comments postId={post.id} />
        </div>
      </article>
    </ThemeBackground>
  );
}
