'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory } from '@/actions/blog/crud';
import { blogKeys, portfolioKeys } from '@/shared/lib/query-keys';

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
  const categoriesKey = defaultType === 'BLOG' ? blogKeys.categories() : portfolioKeys.categories();
  const allCategoriesKeys = [blogKeys.categories(), portfolioKeys.categories()];

  return useMutation({
    mutationFn: (data: Omit<CreateCategoryInput, 'type'>) => createCategory({ ...data, type: defaultType }),
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey });

      const previousCategories = queryClient.getQueryData<CategoryListItem[]>(categoriesKey);

      queryClient.setQueryData<CategoryListItem[]>(categoriesKey, (old = []) => {
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
      queryClient.setQueryData(categoriesKey, context?.previousCategories);
    },
    onSettled: async () => {
      for (const key of allCategoriesKeys) {
        await queryClient.invalidateQueries({ queryKey: key, refetchType: 'active' });
      }
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onMutate: async (deletedId) => {
      // Invalidate both blog and portfolio categories
      await queryClient.cancelQueries({ queryKey: blogKeys.categories() });
      await queryClient.cancelQueries({ queryKey: portfolioKeys.categories() });

      const previousBlogCategories = queryClient.getQueryData<CategoryListItem[]>(blogKeys.categories());
      const previousPortfolioCategories = queryClient.getQueryData<CategoryListItem[]>(portfolioKeys.categories());

      queryClient.setQueryData<CategoryListItem[]>(blogKeys.categories(), (old = []) =>
        old.filter(c => c.id !== deletedId)
      );
      queryClient.setQueryData<CategoryListItem[]>(portfolioKeys.categories(), (old = []) =>
        old.filter(c => c.id !== deletedId)
      );

      return { previousBlogCategories, previousPortfolioCategories };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(blogKeys.categories(), context?.previousBlogCategories);
      queryClient.setQueryData(portfolioKeys.categories(), context?.previousPortfolioCategories);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: blogKeys.categories(), refetchType: 'active' });
      await queryClient.invalidateQueries({ queryKey: portfolioKeys.categories(), refetchType: 'active' });
    },
  });
}
