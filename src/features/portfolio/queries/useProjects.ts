"use client"

import { useQuery } from "@tanstack/react-query"
import { getProjects } from "@/actions/projects"

// Single hook for projects - query function directly from server action
export function useProjects(options?: {
  featured?: boolean
  category?: string
  world?: 'DEV' | 'ART'
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", options],
    queryFn: () => getProjects(options ?? {}),
    refetchOnWindowFocus: false,
  })

  return {
    projects: data ?? [],
    isLoading,
    error,
  }
}
