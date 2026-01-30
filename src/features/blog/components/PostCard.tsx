'use client'

import Link from 'next/link'
import { Calendar, Clock, Eye } from 'lucide-react'
import { useWorldTheme } from '@/components/theme'
import type { Post } from '@/generated/prisma/client'

interface PostCardProps {
  post: Post & { category?: { name: string } | null }
}

export function PostCard({ post }: PostCardProps) {
  const { colors, isDark } = useWorldTheme()

  return (
    <article
      className="group relative overflow-hidden rounded-xl transition-all"
      style={{
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
      }}
    >
      {/* Cover Image */}
      {post.coverImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Category Badge */}
        {post.category && (
          <span
            className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded"
            style={{
              backgroundColor: isDark ? `${colors.text.primary}20` : `${colors.text.primary}30`,
              color: colors.text.primary,
            }}
          >
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h2
          className="mt-3 text-lg sm:text-xl font-bold transition-colors"
          style={{ color: colors.text.primary }}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="hover:underline"
            style={{ textDecorationColor: colors.primary }}
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            className="mt-2 text-sm line-clamp-2"
            style={{ color: colors.text.muted }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div
          className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs"
          style={{ color: colors.text.muted }}
        >
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.publishDate ?? post.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime || Math.ceil(post.content.length / 1000)} min
          </span>
        </div>

        {/* Read More Link */}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: colors.primary }}
        >
          Lire la suite
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Featured Indicator */}
      {post.featured && (
        <div
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
          style={{
            backgroundColor: colors.primary,
            boxShadow: `0 10px 15px -3px ${colors.primary}40`,
          }}
        >
          <Eye className="h-4 w-4" style={{ color: isDark ? '#000' : '#fff' }} />
        </div>
      )}
    </article>
  )
}
