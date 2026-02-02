// Server-side data fetching for Server Components (NO 'use server' directive)
// This file is for use in Server Components only - not exposed as Server Actions

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { Category, PostVersion } from '@/generated/prisma/client';

// Re-export types from query.ts
export type { PostListItem, PostDetail, GetPostsResult } from './query';

// Cached function for Server Components
const getCachedPosts = unstable_cache(
  async ({ published, featured, categoryId, page, limit }: {
    published: boolean;
    featured?: boolean;
    categoryId?: string;
    page: number;
    limit: number;
  }) => {
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = {};
    if (published) where.published = true;
    if (featured) where.featured = true;
    if (categoryId) where.categoryId = categoryId;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          publishDate: true,
          createdAt: true,
          readingTime: true,
          featured: true,
          published: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { publishDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  ['blog-posts'],
  { revalidate: 10, tags: ['blog-posts'] }
);

const getCachedPostBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        publishDate: true,
        createdAt: true,
        readingTime: true,
        tags: true,
        metaTitle: true,
        metaDescription: true,
        featured: true,
        published: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },
  ['blog-post'],
  { revalidate: 10, tags: ['blog-posts'] }
);

const getCachedAllCategories = unstable_cache(
  async ({ type }: { type?: 'BLOG' | 'PROJECT' } = {}) => {
    const where: { type?: 'BLOG' | 'PROJECT' } = {};
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true, projects: true },
        },
      },
    });

    return categories.map((cat) => ({
      ...cat,
      postCount: cat._count.posts,
      projectCount: cat._count.projects,
    }));
  },
  ['categories'],
  { revalidate: 300, tags: ['categories'] }
);

// Public API for Server Components
export async function getPostsForServer({
  published = true,
  featured,
  categoryId,
  page = 1,
  limit = 10,
}: {
  published?: boolean;
  featured?: boolean;
  categoryId?: string;
  page?: number;
  limit?: number;
} = {}) {
  return getCachedPosts({ published, featured, categoryId, page, limit });
}

export async function getPostBySlugForServer(slug: string) {
  return getCachedPostBySlug(slug);
}

export async function getAllCategoriesForServer({ type }: { type?: 'BLOG' | 'PROJECT' } = {}) {
  return getCachedAllCategories({ type });
}
