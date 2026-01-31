"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllCategories, getAllCategoriesUncached } from "@/actions/blog"

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
    queryKey: ["categories", options],
    queryFn: () => (options?.uncached ? getAllCategoriesUncached(options) : getAllCategories(options)),
    refetchOnWindowFocus: false,
  })

  return {
    categories: categories ?? [],
    isLoading,
    error,
  }
}
