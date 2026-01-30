'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjects, getProjectBySlug } from '@/actions/projects';

export function useProjects(options?: { featured?: boolean; category?: string; world?: 'DEV' | 'ART' }) {
  return useQuery({
    queryKey: ['projects', options],
    queryFn: () => getProjects(options || {}),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug,
  });
}
