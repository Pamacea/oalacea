// Centralized query keys for TanStack Query
// Prevents duplicate fetches and ensures cache consistency

import type { CommentStatus } from '@/generated/prisma/client'

// ============================================================================
// Blog Keys
// ============================================================================

export const blogKeys = {
  all: ['blog'] as const,
  posts: () => [...blogKeys.all, 'posts'] as const,
  post: (slug: string) => [...blogKeys.all, 'post', slug] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
} as const

// ============================================================================
// Portfolio Keys
// ============================================================================

export const portfolioKeys = {
  all: ['portfolio'] as const,
  projects: () => [...portfolioKeys.all, 'projects'] as const,
  project: (slug: string) => [...portfolioKeys.all, 'project', slug] as const,
  categories: () => [...portfolioKeys.all, 'categories'] as const,
} as const

// ============================================================================
// Comments Keys
// ============================================================================

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

// ============================================================================
// Auth Keys
// ============================================================================

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  permissions: () => [...authKeys.all, 'permissions'] as const,
} as const

// ============================================================================
// Admin Keys
// ============================================================================

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  recentContent: () => [...adminKeys.all, 'recent-content'] as const,
} as const
