'use client'

import Link from 'next/link'
import { Calendar, Clock, Eye } from 'lucide-react'
import type { Post } from '@/generated/prisma/client'

interface PostCardProps {
  post: Post & { category?: { name: string } | null }
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-none border-2 border-imperium-steel-dark bg-imperium-black transition-all hover:border-imperium-crimson hover:shadow-[4px_4px_0_rgba(154,17,21,0.3)]">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="aspect-video overflow-hidden border-b-2 border-imperium-steel-dark">
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
          <span className="inline-flex items-center px-3 py-1 text-xs font-display uppercase tracking-wider rounded-none bg-imperium-crimson text-imperium-bone border border-imperium-crimson-dark">
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h2 className="mt-3 text-lg sm:text-xl font-display uppercase tracking-wider text-imperium-bone transition-colors">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-imperium-crimson transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-2 text-sm font-terminal text-imperium-steel line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-terminal text-imperium-steel-dark">
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
          className="mt-4 inline-flex items-center gap-2 text-sm font-display uppercase text-imperium-crimson hover:text-imperium-crimson-bright transition-colors"
        >
          Lire la suite
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Featured Indicator */}
      {post.featured && (
        <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-none bg-imperium-gold border-2 border-imperium-gold-dark shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
          <Eye className="h-4 w-4 text-imperium-black" />
        </div>
      )}
    </article>
  )
}
