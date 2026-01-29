import type { Prisma } from '@/generated/prisma/client';

/**
 * Build a Prisma where clause from partial filter object.
 * Filters out undefined values and creates a properly typed where clause.
 */
export function buildWhereClause<T extends Record<string, unknown>>(
  filters: Partial<T>
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      (where as Record<string, unknown>)[key] = value;
    }
  }

  return where;
}

/**
 * Build a Prisma where clause for Comment model.
 */
export function buildCommentWhereClause(
  filters: Partial<{
    postId: string;
    projectId: string;
    status: string;
    parentId: string | null;
  }>
): Prisma.CommentWhereInput {
  const where: Prisma.CommentWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      (where as Record<string, unknown>)[key] = value;
    }
  }

  return where;
}

/**
 * Build a Prisma where clause for Post model.
 */
export function buildPostWhereClause(
  filters: Partial<{
    published: boolean;
    featured: boolean;
    categoryId: string;
  }>
): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      (where as Record<string, unknown>)[key] = value;
    }
  }

  return where;
}
