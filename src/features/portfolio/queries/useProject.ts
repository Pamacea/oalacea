"use client"

import { useQuery } from "@tanstack/react-query"
import { getProjectBySlug } from "@/actions/projects"
import { portfolioKeys } from "@/shared/lib/query-keys"

export function useProject(slug: string) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: portfolioKeys.project(slug),
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug,
  })

  return {
    project: project ?? null,
    isLoading,
    error,
  }
}
