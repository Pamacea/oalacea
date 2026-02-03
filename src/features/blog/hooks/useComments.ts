'use client'

import { useQuery } from '@tanstack/react-query'
import { getComments, getCommentsCount, getPendingComments } from '@/actions/comments'

interface UseCommentsOptions {
  postId?: string
  projectId?: string
  enabled?: boolean
}

export function useComments({ postId, projectId, enabled = true }: UseCommentsOptions) {
  const commentsQuery = useQuery({
    queryKey: ['comments', postId || projectId],
    queryFn: () =>
      getComments({
        postId,
        projectId,
        status: 'APPROVED',
        includeReplies: true,
      }),
    enabled: enabled && Boolean(postId || projectId),
  })

  const countQuery = useQuery({
    queryKey: ['comments-count', postId || projectId],
    queryFn: () =>
      getCommentsCount({
        postId,
        projectId,
        status: 'APPROVED',
      }),
    enabled: enabled && Boolean(postId || projectId),
  })

  return {
    comments: commentsQuery.data || [],
    count: countQuery.data || 0,
    isLoading: commentsQuery.isLoading || countQuery.isLoading,
    error: commentsQuery.error || countQuery.error,
    refetch: () => {
      commentsQuery.refetch()
      countQuery.refetch()
    },
  }
}

export function usePendingComments({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['comments', 'pending', page, limit],
    queryFn: () => getPendingComments({ page, limit }),
  })
}
