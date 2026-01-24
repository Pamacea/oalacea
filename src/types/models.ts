export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  categoryId: string | null
  authorId: string
  createdAt: Date
  updatedAt: Date
  category?: Category
  author?: User
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string | null
  technologies: string[]
  liveUrl: string | null
  repoUrl: string | null
  coverImage: string | null
  featured: boolean
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}
