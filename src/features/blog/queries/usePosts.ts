"use client"

import { useQuery } from "@tanstack/react-query"
import { getPosts } from "@/actions/blog"
import type { PostListItem, PostDetail, GetPostsResult } from "@/actions/blog/query"
import { blogKeys } from "@/shared/lib/query-keys"

// Single hook for posts - query function directly from server action
export function usePosts(options?: {
  featured?: boolean
  categoryId?: string
  page?: number
  limit?: number
  published?: boolean
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [...blogKeys.posts(), options],
    queryFn: () => getPosts({ published: options?.published ?? true, ...options }),
  })

  return {
    posts: data?.posts ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
  }
}

export type { GetPostsResult, PostListItem, PostDetail }
