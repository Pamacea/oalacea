// Server Actions for project export/import functionality
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/core/auth';
import { requirePermission, AuthorizationError } from '@/lib/rbac';
import { projectExportDataSchema, type ProjectExportData } from './projects-export-import.config';

// Export all projects and categories as JSON
export async function exportProjects(): Promise<ProjectExportData> {
  // Check authentication and permissions
  const session = await auth();
  if (!session?.user) {
    throw new AuthorizationError('You must be logged in to export projects');
  }
  requirePermission(session.user.role, 'projects:read');

  const [projects, categories] = await Promise.all([
    prisma.project.findMany({
      include: {
        category: true,
        worldPosition: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: 500, // Limit export to 500 projects
    }),
    prisma.category.findMany({
      where: { type: 'PROJECT' },
      orderBy: { name: 'asc' },
      take: 100,
    }),
  ]);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projects: projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      longDescription: project.longDescription,
      thumbnail: project.thumbnail,
      year: project.year,
      techStack: project.techStack,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      featured: project.featured,
      sortOrder: project.sortOrder,
      categoryId: project.categoryId,
      category: project.category
        ? {
            id: project.category.id,
            name: project.category.name,
            slug: project.category.slug,
            type: project.category.type,
          }
        : null,
      worldPosition: project.worldPosition
        ? {
            world: project.worldPosition.world as 'DEV' | 'ART',
            x: project.worldPosition.x,
            z: project.worldPosition.z,
            y: project.worldPosition.y,
            rotation: project.worldPosition.rotation,
          }
        : null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })),
    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
    })),
  };
}

// Import projects and categories from JSON
export async function importProjects(
  rawData: unknown,
  options: {
    overwrite?: boolean;
    skipExisting?: boolean;
  } = {}
): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  // Check authentication and permissions
  const session = await auth();
  if (!session?.user) {
    throw new AuthorizationError('You must be logged in to import projects');
  }
  requirePermission(session.user.role, 'projects:write');

  // Validate input data
  const validationResult = projectExportDataSchema.safeParse(rawData);
  if (!validationResult.success) {
    throw new Error(
      `Invalid import data: ${validationResult.error.issues.map((i) => i.message).join(', ')}`
    );
  }
  const data = validationResult.data;

  const { overwrite = false, skipExisting = true } = options;
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  // Use transaction for atomic import
  await prisma.$transaction(async (tx) => {
    // Import categories first
    const categoryMap = new Map<string, string>();

    for (const cat of data.categories) {
      try {
        // Check if category exists by slug
        const existing = await tx.category.findUnique({
          where: { slug: cat.slug },
        });

        if (existing) {
          categoryMap.set(cat.id, existing.id);
          if (overwrite) {
            await tx.category.update({
              where: { id: existing.id },
              data: { name: cat.name },
            });
          }
        } else {
          const newCategory = await tx.category.create({
            data: {
              name: cat.name,
              slug: cat.slug,
              type: 'PROJECT',
            },
          });
          categoryMap.set(cat.id, newCategory.id);
        }
      } catch (e) {
        errors.push(`Category "${cat.name}": ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    // Import projects
    for (const project of data.projects) {
      try {
        const existingBySlug = await tx.project.findUnique({
          where: { slug: project.slug },
          include: { worldPosition: true },
        });

        // Resolve categoryId - must have a valid category
        const categoryId = project.categoryId
          ? categoryMap.get(project.categoryId) || project.categoryId
          : null;

        // Skip projects without a valid category
        if (!categoryId) {
          errors.push(`Project "${project.title}": No valid category found`);
          continue;
        }

        if (existingBySlug) {
          if (skipExisting) {
            skipped++;
            continue;
          }
          if (overwrite) {
            // Update project fields
            await tx.project.update({
              where: { id: existingBySlug.id },
              data: {
                slug: project.slug,
                title: project.title,
                description: project.description,
                longDescription: project.longDescription ?? undefined,
                thumbnail: project.thumbnail ?? undefined,
                year: project.year,
                techStack: project.techStack,
                githubUrl: project.githubUrl ?? undefined,
                liveUrl: project.liveUrl ?? undefined,
                featured: project.featured,
                sortOrder: project.sortOrder,
                categoryId,
              },
            });

            // Update world position if provided
            if (project.worldPosition) {
              // Delete old position if exists
              if (existingBySlug.worldPosition) {
                await tx.worldPosition.delete({
                  where: { projectId: existingBySlug.id },
                });
              }
              // Create new position
              await tx.worldPosition.create({
                data: {
                  projectId: existingBySlug.id,
                  world: project.worldPosition.world,
                  x: project.worldPosition.x,
                  z: project.worldPosition.z,
                  y: project.worldPosition.y,
                  rotation: project.worldPosition.rotation,
                },
              });
            }

            imported++;
          } else {
            skipped++;
          }
        } else {
          await tx.project.create({
            data: {
              slug: project.slug,
              title: project.title,
              description: project.description,
              longDescription: project.longDescription,
              techStack: project.techStack,
              githubUrl: project.githubUrl,
              liveUrl: project.liveUrl,
              thumbnail: project.thumbnail,
              featured: project.featured,
              sortOrder: project.sortOrder,
              year: project.year,
              categoryId,
              ...(project.worldPosition && {
                worldPosition: {
                  create: {
                    world: project.worldPosition.world,
                    x: project.worldPosition.x,
                    z: project.worldPosition.z,
                    y: project.worldPosition.y || 0,
                    rotation: project.worldPosition.rotation || 0,
                  },
                },
              }),
            },
            include: {
              worldPosition: true,
              category: true,
            },
          });
          imported++;
        }
      } catch (e) {
        errors.push(`Project "${project.title}": ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  });

  // Revalidate caches
  revalidatePath('/portfolio');
  revalidatePath('/admin/projects');
  revalidateTag('projects', { expire: 0 });
  revalidateTag('project-by-id', { expire: 0 });
  revalidateTag('categories', { expire: 0 });

  return { imported, skipped, errors };
}
