'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectCategories } from '@/actions/projects';

export type ProjectCategory = {
  id: string;
  name: string;
  slug: string;
};

export function useProjectCategories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['project-categories'],
    queryFn: async () => {
      const result = await getProjectCategories();
      return result || [];
    },
    refetchOnWindowFocus: false,
  });

  return {
    categories,
    isLoading,
  };
}
