'use client'

import { useBlogPosts } from '../hooks'
import type { PostListItem, GetPostsResult } from '@/actions/blog'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock } from 'lucide-react'
import { GlitchText } from '@/components/ui/imperium'
import { BrutalCard } from '@/components/navigation/BrutalBackground'

export function BlogsPageClient({ initialData }: { initialData?: GetPostsResult } = {}) {
  const { data: postsData, isLoading } = useBlogPosts({ limit: 100, initialData })
  const posts = postsData?.posts ?? []

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 text-center py-12">
        <div className="inline-block border-2 border-imperium-crimson bg-imperium-black-raise px-8 py-6">
          <h1 className="font-display text-4xl uppercase tracking-widest text-imperium-crimson mb-4">
            <GlitchText>Archives</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel-dark">
            {'>'} Loading database...
          </p>
        </div>
      </div>
    )
  }

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 text-center py-12">
        <div className="inline-block border-2 border-imperium-crimson bg-imperium-black-raise px-8 py-6">
          <h1 className="font-display text-4xl uppercase tracking-widest text-imperium-crimson mb-4">
            <GlitchText>Archives</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel-dark">
            {'>'} No records found in database
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4/5 mx-auto px-4">
      <header className="mb-12">
        <div className="inline-block border-2 border-imperium-crimson bg-imperium-black-raise px-6 py-4 relative">
          <div className="absolute w-full h-full border-2 border-imperium-silver"/>
          <div className="absolute w-1/2 h-1/2 border-2 border-imperium-black-raise"/>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-widest text-imperium-crimson">
            <GlitchText>Archives</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel mt-2">
            {'>'} Knowledge database access terminal
          </p>
        </div>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

function PostCard({ post }: { post: PostListItem }) {
  return (
    <BrutalCard hovered className="group cursor-pointer">
      <Link href={`/blogs/${post.slug}`} className="block">
        {post.coverImage && (
          <div className="aspect-video overflow-hidden border-b-2 border-imperium-steel-dark/50 relative">
            <div className="absolute inset-0 bg-imperium-crimson/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full h-full" style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent_1px, rgba(154,17,21,0.2)_1px, rgba(154,17,21,0.2)_2px)',
              }} />
            </div>
            <Image
              src={post.coverImage}
              alt={post.title}
              width={400}
              height={225}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}

        <div className="p-5">
          {post.category && (
            <span className="inline-flex items-center px-2 py-0.5 font-terminal text-xs font-semibold border border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson mb-3">
              {post.category.name}
            </span>
          )}

          <h2 className="font-display text-lg uppercase tracking-wider mb-2">
            <span className="text-imperium-bone group-hover:text-imperium-crimson transition-colors">
              {post.title}
            </span>
          </h2>

          {post.excerpt && (
            <p className="font-terminal text-sm text-imperium-steel line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 font-terminal text-xs text-imperium-steel-dark mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-imperium-gold" />
              {new Date(post.publishDate ?? post.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-imperium-steel" />
              {post.readingTime || 5} min
            </span>
          </div>

          <div className="flex items-center gap-2 font-terminal text-sm text-imperium-crimson uppercase">
            <span>{'>'}</span>
            <span className="group-hover:text-imperium-gold transition-colors">Access record</span>
            <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {post.featured && (
          <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center border border-imperium-crimson bg-imperium-crimson text-imperium-bone text-xs font-bold">
            ★
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-imperium-crimson to-transparent opacity-50" />
      </Link>
    </BrutalCard>
  )
}
