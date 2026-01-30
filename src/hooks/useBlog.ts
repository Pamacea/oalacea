'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getPosts, getPostBySlug } from '@/actions/blog';

export function useBlogPosts(options?: { published?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['blog-posts', options],
    queryFn: () => getPosts({ published: true, limit: 100, ...options }),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
  });
}

export function useBlogPostSuspense(slug: string) {
  return useSuspenseQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getPostBySlug(slug),
  });
}
