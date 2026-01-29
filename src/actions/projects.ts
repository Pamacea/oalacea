// Server Actions pour les projets portfolio - Using Prisma in Server Components
'use server';

import { revalidatePath, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Project, WorldPosition, Prisma } from '@/generated/prisma/client';
import { ProjectCategory } from '@/generated/prisma/enums';
import { NotFoundError } from '@/core/errors';

type ProjectWithWorldPosition = Project & { worldPosition: WorldPosition | null };

// =========================================
// GET ACTIONS (cached with unstable_cache)
// =========================================

const getCachedProjects = unstable_cache(
  async ({ featured, category }: {
    featured?: boolean;
    category?: string;
  }) => {
    const where: Prisma.ProjectWhereInput = {};
    if (featured) where.featured = true;
    if (category) {
      const upperCategory = category.toUpperCase() as keyof typeof ProjectCategory;
      where.category = ProjectCategory[upperCategory] ?? category;
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
        category: true,
        featured: true,
        sortOrder: true,
        techStack: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { year: 'desc' },
      ],
    });
  },
  ['projects'],
  { revalidate: 120 }
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
        category: true,
        featured: true,
        techStack: true,
        githubUrl: true,
        liveUrl: true,
      },
    });
  },
  ['project'],
  { revalidate: 120 }
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
type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  year: number;
  category: string;
  featured: boolean;
  sortOrder: number;
  techStack: string[];
};

type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  thumbnail: string | null;
  year: number;
  category: string;
  featured: boolean;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
};

export async function getProjects({
  featured,
  category,
}: {
  featured?: boolean;
  category?: string;
} = {}): Promise<ProjectListItem[]> {
  return getCachedProjects({ featured, category });
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  return getCachedProjectBySlug(slug);
}

export async function getProjectById(id: string) {
  return getCachedProjectById(id);
}

export async function getProjectCategories() {
  return Object.values(ProjectCategory);
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
  category: ProjectCategory;
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
      category: data.category,
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
  });

  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${data.slug}`);
  revalidatePath('/admin/projects');

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
    category?: ProjectCategory;
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
      ...(data.techStack && { techStack: data.techStack }),
      ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
      ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl }),
      ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.year && { year: data.year }),
      ...(data.category && { category: data.category }),
    },
  });

  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${currentProject.slug}`);
  revalidatePath('/admin/projects');

  return project;
}

export async function deleteProject(id: string) {
  await prisma.project.delete({
    where: { id },
  });

  revalidatePath('/portfolio');
  revalidatePath('/admin/projects');

  return { success: true };
}

export async function deleteProjectWithRevalidate(id: string) {
  await prisma.project.delete({
    where: { id },
  });

  revalidatePath('/portfolio');
  revalidatePath('/admin/projects');

  return { success: true };
}
