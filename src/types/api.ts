export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message?: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
  category?: {
    id: string
    name: string
    slug: string
  }
}

export interface ProjectListItem {
  id: string
  title: string
  slug: string
  description: string
  technologies: string[]
  coverImage: string | null
  featured: boolean
  createdAt: Date
}
