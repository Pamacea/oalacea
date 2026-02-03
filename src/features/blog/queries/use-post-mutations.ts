'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, updatePost, deletePost } from '@/actions/blog';
import { blogKeys } from '@/shared/lib/query-keys';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createPost>[0]) => createPost(data),
    onSuccess: async () => {
      // Invalidate all blog-posts queries with any options - use precise invalidation
      await queryClient.invalidateQueries({ queryKey: blogKeys.posts(), refetchType: 'active' });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Parameters<typeof updatePost>[1] }) =>
      updatePost(slug, data),
    onSuccess: async (_, variables) => {
      // Invalidate posts list and specific post
      await queryClient.invalidateQueries({ queryKey: blogKeys.posts(), refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: blogKeys.post(variables.slug) });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deletePost(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: blogKeys.posts(), refetchType: 'active' });
    },
  });
}
