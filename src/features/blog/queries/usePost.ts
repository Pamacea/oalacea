"use client"

import { useQuery } from "@tanstack/react-query"
import { getPostBySlug } from "@/actions/blog"
import type { PostDetail } from "@/actions/blog"
import { blogKeys } from "@/shared/lib/query-keys"

export function usePost(slug: string) {
  const { data: post, isLoading, error } = useQuery({
    queryKey: blogKeys.post(slug),
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
  })

  return {
    post: post ?? null,
    isLoading,
    error,
  }
}

export type { PostDetail }
