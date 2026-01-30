"use client"

import { useQuery } from "@tanstack/react-query"
import { getProjects } from "@/actions/projects"

export function useProjects(options?: {
  featured?: boolean
  category?: string
  world?: 'DEV' | 'ART'
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", options],
    queryFn: () => getProjects(options ?? {}),
  })

  return {
    projects: data ?? [],
    isLoading,
    error,
  }
}
