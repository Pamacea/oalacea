// Configuration and types for blog export/import functionality
import { z } from 'zod';

// Maximum file size for import (10MB)
export const MAX_IMPORT_SIZE = 10 * 1024 * 1024;

// Zod schema for validation
const exportCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  type: z.enum(['BLOG', 'PROJECT']),
});

const exportPostSchema = z.object({
  id: z.string(),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  excerpt: z.string().nullable(),
  content: z.string().max(5_000_000), // 5MB max content
  coverImage: z.string().url().nullable(),
  publishDate: z.string().datetime().nullable(),
  readingTime: z.number().int().min(0).nullable(),
  tags: z.array(z.string()).max(20).nullable(),
  metaTitle: z.string().max(60).nullable(),
  metaDescription: z.string().max(160).nullable(),
  featured: z.boolean(),
  published: z.boolean(),
  categoryId: z.string().nullable(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    type: z.string(),
  }).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const blogExportDataSchema = z.object({
  version: z.string().regex(/^\d+\.\d+$/),
  exportedAt: z.string().datetime(),
  posts: z.array(exportPostSchema).max(1000), // Max 1000 posts per import
  categories: z.array(exportCategorySchema).max(100), // Max 100 categories
});

// Export types
export type BlogExportData = z.infer<typeof blogExportDataSchema>;
