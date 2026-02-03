'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllCategoriesUncached } from '@/actions/blog';
import { blogKeys } from '@/shared/lib/query-keys';

export type ProjectCategory = {
  id: string;
  name: string;
  slug: string;
};

export function useProjectCategories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: blogKeys.categories(),
    queryFn: async () => {
      const result = await getAllCategoriesUncached();
      return result || [];
    },
  });

  return {
    categories,
    isLoading,
  };
}
