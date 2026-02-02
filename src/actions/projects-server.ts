// Server-side data fetching for Server Components (NO 'use server' directive)
// This file is for use in Server Components only - not exposed as Server Actions

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  year: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  featured: boolean;
  sortOrder: number;
  techStack: string[];
  worldPosition?: {
    world: 'DEV' | 'ART';
    x: number;
    z: number;
  } | null;
};

type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  thumbnail: string | null;
  year: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  featured: boolean;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
};

const getCachedProjects = unstable_cache(
  async ({ featured, category, world }: {
    featured?: boolean;
    category?: string;
    world?: 'DEV' | 'ART';
  }) => {
    const where: Prisma.ProjectWhereInput = {};
    if (featured) where.featured = true;
    if (category) {
      where.category = { slug: category };
    }
    if (world) {
      where.worldPosition = { world };
    }

    return prisma.project.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnail: true,
        year: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        featured: true,
        sortOrder: true,
        techStack: true,
        worldPosition: {
          select: {
            world: true,
            x: true,
            z: true,
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { year: 'desc' },
      ],
    });
  },
  ['projects'],
  { revalidate: 120, tags: ['projects'] }
);

const getCachedProjectBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        longDescription: true,
        thumbnail: true,
        year: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        featured: true,
        techStack: true,
        githubUrl: true,
        liveUrl: true,
      },
    });
  },
  ['project'],
  { revalidate: 120, tags: ['projects'] }
);

// Public API for Server Components
export async function getProjectsForServer({
  featured,
  category,
  world,
}: {
  featured?: boolean;
  category?: string;
  world?: 'DEV' | 'ART';
} = {}): Promise<ProjectListItem[]> {
  return getCachedProjects({ featured, category, world });
}

export async function getProjectBySlugForServer(slug: string): Promise<ProjectDetail | null> {
  return getCachedProjectBySlug(slug);
}
