"use client"

import { useQuery } from "@tanstack/react-query"
import { getProjectBySlug } from "@/actions/projects"

export function useProject(slug: string) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug,
  })

  return {
    project: project ?? null,
    isLoading,
    error,
  }
}
