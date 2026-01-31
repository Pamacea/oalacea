'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, updatePost, deletePost } from '@/actions/blog';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createPost>[0]) => createPost(data),
    onSuccess: async () => {
      // Invalidate all blog-posts queries with any options
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Parameters<typeof updatePost>[1] }) =>
      updatePost(slug, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deletePost(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}
