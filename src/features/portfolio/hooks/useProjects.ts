"use client"

import { useQuery } from "@tanstack/react-query"

export function useProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      return res.json()
    },
  })

  return {
    projects,
    isLoading,
  }
}
