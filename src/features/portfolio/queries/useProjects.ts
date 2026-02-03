"use client"

import { useQuery } from "@tanstack/react-query"
import { getProjects } from "@/actions/projects"
import { portfolioKeys } from "@/shared/lib/query-keys"

// Single hook for projects - query function directly from server action
export function useProjects(options?: {
  featured?: boolean
  category?: string
  world?: 'DEV' | 'ART'
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [...portfolioKeys.projects(), options],
    queryFn: () => getProjects(options ?? {}),
  })

  return {
    projects: data ?? [],
    isLoading,
    error,
  }
}
