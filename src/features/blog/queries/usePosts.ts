"use client"

import { useQuery } from "@tanstack/react-query"
import { getPosts } from "@/actions/blog"
import type { PostListItem, PostDetail, GetPostsResult } from "@/actions/blog/query"

// Single hook for posts - query function directly from server action
export function usePosts(options?: {
  featured?: boolean
  categoryId?: string
  page?: number
  limit?: number
  published?: boolean
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-posts", options],
    queryFn: () => getPosts({ published: options?.published ?? true, ...options }),
    refetchOnWindowFocus: false,
  })

  return {
    posts: data?.posts ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
  }
}

export type { GetPostsResult, PostListItem, PostDetail }
