// Portfolio feature types
import type { Project } from '@/generated/prisma/client'

export type ProjectWithPosition = Project & {
  worldPosition?: { x: number; y: number; z: number } | null
}

export type ProjectCategory = 'WEB' | 'MOBILE' | 'THREE_D' | 'AI' | 'OTHER'

export type PortfolioFilters = {
  category?: ProjectCategory
  search?: string
  featured?: boolean
  year?: number
  tech?: string
}
