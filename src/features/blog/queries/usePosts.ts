"use client"

import { useQuery } from "@tanstack/react-query"
import { getPosts, type GetPostsResult } from "@/actions/blog"

export function usePosts(options?: {
  featured?: boolean
  categoryId?: string
  page?: number
  limit?: number
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-posts", options],
    queryFn: () => getPosts({ published: true, ...options }),
  })

  return {
    posts: data?.posts ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
  }
}

export type { GetPostsResult, PostListItem, PostDetail }
