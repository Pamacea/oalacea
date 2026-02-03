// Server Actions for blog export/import functionality
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/core/auth';
import { requirePermission, AuthorizationError } from '@/lib/rbac';
import { blogExportDataSchema, type BlogExportData } from './export-import.config';

// Export all posts and categories as JSON
export async function exportBlogs(): Promise<BlogExportData> {
  // Check authentication and permissions
  const session = await auth();
  if (!session?.user) {
    throw new AuthorizationError('You must be logged in to export blogs');
  }
  requirePermission(session.user.role, 'posts:read');

  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit export to 1000 posts
    }),
    prisma.category.findMany({
      where: { type: 'BLOG' },
      orderBy: { name: 'asc' },
      take: 100,
    }),
  ]);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    posts: posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      publishDate: post.publishDate?.toISOString() ?? null,
      readingTime: post.readingTime,
      tags: post.tags,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      featured: post.featured,
      published: post.published,
      categoryId: post.categoryId,
      category: post.category
        ? {
            id: post.category.id,
            name: post.category.name,
            slug: post.category.slug,
            type: post.category.type,
          }
        : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    })),
    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
    })),
  };
}

// Import posts and categories from JSON
export async function importBlogs(
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
    throw new AuthorizationError('You must be logged in to import blogs');
  }
  requirePermission(session.user.role, 'posts:write');

  // Validate input data
  const validationResult = blogExportDataSchema.safeParse(rawData);
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
              type: 'BLOG',
            },
          });
          categoryMap.set(cat.id, newCategory.id);
        }
      } catch (e) {
        errors.push(`Category "${cat.name}": ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    // Import posts
    for (const post of data.posts) {
      try {
        const existingBySlug = await tx.post.findUnique({
          where: { slug: post.slug },
        });

        // Resolve categoryId - use mapped category or skip if not found
        const categoryId = post.categoryId
          ? categoryMap.get(post.categoryId) || undefined
          : null;

        if (existingBySlug) {
          if (skipExisting) {
            skipped++;
            continue;
          }
          if (overwrite) {
            await tx.post.update({
              where: { id: existingBySlug.id },
              data: {
                title: post.title,
                excerpt: post.excerpt ?? undefined,
                content: post.content,
                coverImage: post.coverImage ?? undefined,
                publishDate: post.publishDate ? new Date(post.publishDate) : null,
                readingTime: post.readingTime ?? undefined,
                tags: post.tags ?? undefined,
                metaTitle: post.metaTitle ?? undefined,
                metaDescription: post.metaDescription ?? undefined,
                featured: post.featured,
                published: post.published,
                categoryId,
              },
            });
            imported++;
          } else {
            skipped++;
          }
        } else {
          await tx.post.create({
            data: {
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt ?? undefined,
              content: post.content,
              coverImage: post.coverImage ?? undefined,
              publishDate: post.publishDate ? new Date(post.publishDate) : null,
              readingTime: post.readingTime ?? undefined,
              tags: post.tags ?? undefined,
              metaTitle: post.metaTitle ?? undefined,
              metaDescription: post.metaDescription ?? undefined,
              featured: post.featured,
              published: post.published,
              categoryId,
            },
          });
          imported++;
        }
      } catch (e) {
        errors.push(`Post "${post.title}": ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  });

  // Revalidate caches
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  revalidateTag('blog-posts', { expire: 0 });
  revalidateTag('categories', { expire: 0 });

  return { imported, skipped, errors };
}
