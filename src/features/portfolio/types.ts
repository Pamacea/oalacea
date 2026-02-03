// Portfolio feature types
import type { Project } from '@/generated/prisma/client'
import type { Category } from '@/generated/prisma/client'

export type ProjectWithPosition = Project & {
  worldPosition?: { x: number; y: number; z: number } | null
  category?: Category | null
}

export type PortfolioFilters = {
  categoryId?: string
  search?: string
  featured?: boolean
  year?: number
  tech?: string
}
