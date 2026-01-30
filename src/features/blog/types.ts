// Blog feature types
import type { Post, Category } from '@/generated/prisma/client'

export type PostWithCategory = Post & {
  category?: { name: string } | null
}

export type CategoryWithCount = Category & {
  _count?: { posts: number }
}

export type BlogFilters = {
  category?: string
  search?: string
  featured?: boolean
  year?: number
  month?: number
}
