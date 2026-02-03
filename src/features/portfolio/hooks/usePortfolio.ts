'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjects, getProjectBySlug } from '@/actions/projects';
import { portfolioKeys } from '@/shared/lib/query-keys';

// NOTE: These are legacy hooks - use @/features/portfolio/queries instead
export function useProjects(options?: { featured?: boolean; category?: string; world?: 'DEV' | 'ART' }) {
  return useQuery({
    queryKey: [...portfolioKeys.projects(), options],
    queryFn: () => getProjects(options || {}),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: portfolioKeys.project(slug),
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug,
  });
}
