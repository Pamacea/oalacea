'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getPostBySlug, getPostsUncached, getPostBySlugUncached } from '@/actions/blog';
import type { GetPostsResult } from '@/actions/blog';

export function useBlogPosts(options?: { published?: boolean; limit?: number; initialData?: GetPostsResult }) {
  return useQuery({
    queryKey: ['blog-posts', options],
    queryFn: () => getPostsUncached({ published: true, limit: 100, ...options }),
    refetchOnWindowFocus: false,
    staleTime: 60000,
    gcTime: 300000,
    initialData: options?.initialData,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getPostBySlugUncached(slug),
    enabled: !!slug,
  });
}

export function useBlogPostSuspense(slug: string) {
  return useSuspenseQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getPostBySlug(slug),
  });
}
