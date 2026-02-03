import type { CommentStatus } from '@/generated/prisma/client'

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (filters: { postId?: string; projectId?: string; status?: CommentStatus }) =>
    [...commentKeys.lists(), filters] as const,
  counts: () => [...commentKeys.all, 'count'] as const,
  count: (filters: { postId?: string; projectId?: string }) =>
    [...commentKeys.counts(), filters] as const,
  pending: (page: number, limit: number) =>
    [...commentKeys.all, 'pending', page, limit] as const,
  detail: (id: string) => [...commentKeys.all, 'detail', id] as const,
} as const
