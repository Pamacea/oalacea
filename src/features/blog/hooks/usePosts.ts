"use client"

import { useQuery } from "@tanstack/react-query"

export function usePostsClient() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog/posts")
      if (!res.ok) throw new Error("Failed to fetch posts")
      return res.json()
    },
  })

  return {
    posts,
    isLoading,
  }
}
