import { type ProjectInput } from "@/lib/validations"
import type { Project, ProjectListItem } from "@/types"

export async function getProjects(limit = 9): Promise<ProjectListItem[]> {
  return []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return null
}

export async function getFeaturedProjects(): Promise<ProjectListItem[]> {
  return []
}

export async function createProject(data: ProjectInput): Promise<Project> {
  throw new Error("Not implemented")
}

export async function updateProject(id: string, data: Partial<ProjectInput>): Promise<Project> {
  throw new Error("Not implemented")
}

export async function deleteProject(id: string): Promise<void> {
  throw new Error("Not implemented")
}
