// Configuration and types for project export/import functionality
import { z } from 'zod';

// Maximum file size for import (10MB)
export const MAX_IMPORT_SIZE = 10 * 1024 * 1024;

// Zod schema for validation
const exportProjectCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  type: z.enum(['BLOG', 'PROJECT']),
});

const exportWorldPositionSchema = z.object({
  world: z.enum(['DEV', 'ART']),
  x: z.number(),
  z: z.number(),
  y: z.number().default(0),
  rotation: z.number().default(0),
});

const exportProjectSchema = z.object({
  id: z.string(),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  longDescription: z.string().max(50_000).nullable(),
  thumbnail: z.string().url().nullable(),
  year: z.number().int().min(1990).max(2100),
  techStack: z.array(z.string()).max(50),
  githubUrl: z.string().url().nullable(),
  liveUrl: z.string().url().nullable(),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
  categoryId: z.string(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    type: z.string(),
  }).nullable(),
  worldPosition: exportWorldPositionSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const projectExportDataSchema = z.object({
  version: z.string().regex(/^\d+\.\d+$/),
  exportedAt: z.string().datetime(),
  projects: z.array(exportProjectSchema).max(500), // Max 500 projects per import
  categories: z.array(exportProjectCategorySchema).max(100), // Max 100 categories
});

// Export types
export type ProjectExportData = z.infer<typeof projectExportDataSchema>;
