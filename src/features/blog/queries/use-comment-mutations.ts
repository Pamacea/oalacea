'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createComment,
  updateCommentStatus,
  approveComment,
  rejectComment,
  markCommentAsSpam,
  deleteComment,
  updateComment,
} from '@/actions/comments'
import { commentKeys } from '@/shared/lib/query-keys'
import type { CommentInput } from '@/lib/validations'
import type { CommentStatus } from '@/generated/prisma/client'

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CommentInput & { userAgent?: string }) => createComment(data),
    onSuccess: async (result, input) => {
      if (result.success) {
        toast.success(result.message ?? 'Comment submitted for moderation')
        // Invalidate comments count and list - use precise invalidation
        const invalidateKeys = input.postId
          ? [commentKeys.list({ postId: input.postId }), commentKeys.count({ postId: input.postId })]
          : input.projectId
            ? [commentKeys.list({ projectId: input.projectId }), commentKeys.count({ projectId: input.projectId })]
            : [commentKeys.lists(), commentKeys.counts()]

        for (const key of invalidateKeys) {
          await queryClient.invalidateQueries({ queryKey: key })
        }
      } else if (result.error) {
        toast.error(result.error)
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to submit comment')
    },
  })
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CommentStatus }) =>
      updateCommentStatus(id, status),
    onSuccess: async () => {
      toast.success('Comment status updated')
      // Only invalidate active queries, not all
      await queryClient.invalidateQueries({ queryKey: commentKeys.lists(), refetchType: 'active' })
      await queryClient.invalidateQueries({ queryKey: commentKeys.pending(1, 20) })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update comment status')
    },
  })
}

export function useApproveComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveComment(id),
    onSuccess: async () => {
      toast.success('Comment approved')
      await queryClient.invalidateQueries({ queryKey: commentKeys.lists(), refetchType: 'active' })
      await queryClient.invalidateQueries({ queryKey: commentKeys.pending(1, 20) })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to approve comment')
    },
  })
}

export function useRejectComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rejectComment(id),
    onSuccess: async () => {
      toast.success('Comment rejected')
      await queryClient.invalidateQueries({ queryKey: commentKeys.lists(), refetchType: 'active' })
      await queryClient.invalidateQueries({ queryKey: commentKeys.pending(1, 20) })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reject comment')
    },
  })
}

export function useMarkCommentAsSpam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markCommentAsSpam(id),
    onSuccess: async () => {
      toast.success('Comment marked as spam')
      await queryClient.invalidateQueries({ queryKey: commentKeys.lists(), refetchType: 'active' })
      await queryClient.invalidateQueries({ queryKey: commentKeys.pending(1, 20) })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to mark comment as spam')
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: async () => {
      toast.success('Comment deleted')
      await queryClient.invalidateQueries({ queryKey: commentKeys.lists(), refetchType: 'active' })
      await queryClient.invalidateQueries({ queryKey: commentKeys.pending(1, 20) })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, { content }),
    onSuccess: async () => {
      toast.success('Comment updated')
      await queryClient.invalidateQueries({ queryKey: commentKeys.lists(), refetchType: 'active' })
      await queryClient.invalidateQueries({ queryKey: commentKeys.pending(1, 20) })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update comment')
    },
  })
}
