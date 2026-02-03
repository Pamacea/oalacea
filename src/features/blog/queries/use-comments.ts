'use client'

import { useQuery, useQueries } from '@tanstack/react-query'
import { getComments, getCommentsCount, getPendingComments } from '@/actions/comments'
import { commentKeys } from '@/shared/lib/query-keys'
import type { CommentStatus } from '@/generated/prisma/client'

interface UseCommentsOptions {
  postId?: string
  projectId?: string
  status?: CommentStatus | 'ALL'
  includeReplies?: boolean
  enabled?: boolean
}

// Optimized: Fetches comments and count in parallel with proper cache keys
export function useComments({
  postId,
  projectId,
  status = 'APPROVED',
  includeReplies = true,
  enabled = true,
}: UseCommentsOptions = {}) {
  const results = useQueries({
    queries: [
      {
        queryKey: commentKeys.list({ postId, projectId, status: status === 'ALL' ? undefined : status }),
        queryFn: () => getComments({ postId, projectId, status, includeReplies }),
        enabled: enabled && Boolean(postId || projectId),
      },
      {
        queryKey: commentKeys.count({ postId, projectId }),
        queryFn: () => getCommentsCount({ postId, projectId, status: status === 'ALL' ? 'APPROVED' : status }),
        enabled: enabled && Boolean(postId || projectId),
      },
    ],
  })

  const commentsQuery = results[0]
  const countQuery = results[1]

  return {
    comments: commentsQuery.data ?? [],
    count: countQuery.data ?? 0,
    isLoading: commentsQuery.isLoading || countQuery.isLoading,
    error: commentsQuery.error || countQuery.error,
    refetch: () => Promise.all([
      commentsQuery.refetch(),
      countQuery.refetch(),
    ]),
  }
}

export function usePendingComments(page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: commentKeys.pending(page, limit),
    queryFn: () => getPendingComments({ page, limit }),
    enabled,
  })
}

export function useCommentById(id: string, enabled = true) {
  return useQuery({
    queryKey: commentKeys.detail(id),
    queryFn: () => getComments({ postId: id }).then((comments) => comments[0] ?? null),
    enabled: enabled && Boolean(id),
  })
}
