"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllCategories, getAllCategoriesUncached } from "@/actions/blog"
import { blogKeys } from "@/shared/lib/query-keys"

export type CategoryListItem = {
  id: string
  slug: string
  name: string
  type: 'BLOG' | 'PROJECT'
  postCount: number
  projectCount: number
}

export function useCategories(options?: {
  type?: 'BLOG' | 'PROJECT'
  uncached?: boolean
}) {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: [...blogKeys.categories(), options],
    queryFn: () => (options?.uncached ? getAllCategoriesUncached(options) : getAllCategories(options)),
  })

  return {
    categories: categories ?? [],
    isLoading,
    error,
  }
}
