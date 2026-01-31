'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject, updateProject, deleteProject } from '@/actions/projects';

export type CreateProjectInput = {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  thumbnail?: string;
  featured?: boolean;
  sortOrder?: number;
  year: number;
  categoryId: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: async () => {
      // Invalidate all projects queries with any options
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) => updateProject(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
