// Server Actions pour les projets portfolio - Using Prisma in Server Components
'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Project, WorldPosition, Prisma } from '@/generated/prisma/client';
import { NotFoundError } from '@/core/errors';

type ProjectWithWorldPosition = Project & { worldPosition: WorldPosition | null };

// =========================================
// GET ACTIONS (cached with unstable_cache)
// =========================================

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

const getCachedProjectById = unstable_cache(
  async (id: string) => {
    return prisma.project.findUnique({
      where: { id },
      include: { worldPosition: true },
    });
  },
  ['project-by-id'],
  { revalidate: 120, tags: ['project-by-id'] }
);

// Public API using cached functions
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

export async function getProjects({
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

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  return getCachedProjectBySlug(slug);
}

export async function getProjectById(id: string) {
  return getCachedProjectById(id);
}

export async function getProjectCategories() {
  const categories = await prisma.category.findMany({
    where: { type: 'PROJECT' },
    orderBy: { name: 'asc' },
  });
  return categories;
}

// =========================================
// ADMIN ACTIONS (uncached for real-time updates)
// =========================================

// Uncached version for admin - bypasses cache entirely
export async function getProjectsUncached({
  featured,
  category,
  world,
}: {
  featured?: boolean;
  category?: string;
  world?: 'DEV' | 'ART';
} = {}): Promise<ProjectListItem[]> {
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
}

// =========================================
// MUTATION ACTIONS (invalidate cache)
// =========================================

export async function createProject(data: {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  thumbnail?: string;
  featured?: boolean;
  sortOrder?: number;
  year: number;
  categoryId: string;
  worldPosition?: {
    world: 'DEV' | 'ART';
    x: number;
    z: number;
    y?: number;
    rotation?: number;
  };
}) {
  const project = await prisma.project.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      longDescription: data.longDescription,
      techStack: data.techStack,
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl,
      thumbnail: data.thumbnail,
      featured: data.featured || false,
      sortOrder: data.sortOrder || 0,
      year: data.year,
      categoryId: data.categoryId,
      ...(data.worldPosition && {
        worldPosition: {
          create: {
            world: data.worldPosition.world,
            x: data.worldPosition.x,
            z: data.worldPosition.z,
            y: data.worldPosition.y || 0,
            rotation: data.worldPosition.rotation || 0,
          },
        },
      }),
    },
    include: {
      worldPosition: true,
      category: true,
    },
  });

  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${data.slug}`);
  revalidatePath('/admin/projects');
  revalidateTag('projects', { expire: 0 });
  revalidateTag('project-by-id', { expire: 0 });

  return project;
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    description?: string;
    longDescription?: string;
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
    thumbnail?: string;
    featured?: boolean;
    sortOrder?: number;
    year?: number;
    categoryId?: string;
    worldPosition?: {
      world: 'DEV' | 'ART';
      x: number;
      z: number;
      y?: number;
      rotation?: number;
    };
  }
) {
  const currentProject = await prisma.project.findUnique({
    where: { id },
    include: { worldPosition: true },
  });

  if (!currentProject) {
    throw new NotFoundError('Project', id);
  }

  // Update world position if provided
  if (data.worldPosition) {
    // Delete old position
    if (currentProject.worldPosition) {
      await prisma.worldPosition.delete({
        where: { projectId: id },
      });
    }
    // Create new position
    await prisma.worldPosition.create({
      data: {
        projectId: id,
        world: data.worldPosition.world,
        x: data.worldPosition.x,
        z: data.worldPosition.z,
        y: data.worldPosition.y || 0,
        rotation: data.worldPosition.rotation || 0,
      },
    });
  }

  // Update project fields
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.longDescription !== undefined && { longDescription: data.longDescription }),
      ...(data.techStack !== undefined && { techStack: data.techStack }),
      ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
      ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl }),
      ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.year && { year: data.year }),
      ...(data.categoryId && { categoryId: data.categoryId }),
    },
    include: {
      worldPosition: true,
      category: true,
    },
  });

  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${currentProject.slug}`);
  revalidatePath('/admin/projects');
  revalidateTag('projects', { expire: 0 });
  revalidateTag('project-by-id', { expire: 0 });

  return project;
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });
  } catch (error) {
    // If record not found (P2025), treat as success (already deleted)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      // Already deleted - continue
    } else {
      throw error;
    }
  }

  revalidatePath('/portfolio');
  revalidatePath('/admin/projects');
  revalidateTag('projects', { expire: 0 });
  revalidateTag('project-by-id', { expire: 0 });

  return { success: true };
}

export async function deleteProjectWithRevalidate(id: string): Promise<void> {
  try {
    await prisma.project.delete({
      where: { id },
    });
  } catch (error) {
    // If record not found (P2025), treat as success (already deleted)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      // Already deleted - continue
    } else {
      throw error;
    }
  }

  revalidatePath('/portfolio');
  revalidatePath('/admin/projects');
  revalidateTag('projects', { expire: 0 });
  revalidateTag('project-by-id', { expire: 0 });
}
