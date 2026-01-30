"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllCategories } from "@/actions/blog"

export function useCategories() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => getAllCategories(),
  })

  return {
    categories: categories ?? [],
    isLoading,
    error,
  }
}
