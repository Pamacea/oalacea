'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory } from '@/actions/blog/crud';

export type CreateCategoryInput = {
  name: string;
  slug: string;
  type?: 'BLOG' | 'PROJECT';
};

export type CategoryListItem = {
  id: string;
  slug: string;
  name: string;
  type: 'BLOG' | 'PROJECT';
  postCount: number;
  projectCount: number;
};

export function useCreateCategory(defaultType: 'BLOG' | 'PROJECT' = 'BLOG') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateCategoryInput, 'type'>) => createCategory({ ...data, type: defaultType }),
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      const previousCategories = queryClient.getQueryData<CategoryListItem[]>(['categories']);

      queryClient.setQueryData<CategoryListItem[]>(['categories'], (old = []) => {
        const slug = newCategory.slug;
        if (old.some(c => c.slug === slug)) return old;
        return [...old, {
          id: `temp-${Date.now()}`,
          slug,
          name: newCategory.name,
          type: defaultType,
          postCount: 0,
          projectCount: 0,
        }];
      });

      return { previousCategories };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['categories'], context?.previousCategories);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      const previousCategories = queryClient.getQueryData<CategoryListItem[]>(['categories']);

      queryClient.setQueryData<CategoryListItem[]>(['categories'], (old = []) =>
        old.filter(c => c.id !== deletedId)
      );

      return { previousCategories };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['categories'], context?.previousCategories);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
