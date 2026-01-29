// Server Actions for blog queries (GET operations)
'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Category, Post, PostVersion, Prisma } from '@/generated/prisma/client';

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishDate: Date | null;
  createdAt: Date;
  readingTime: number | null;
  featured: boolean;
  published: boolean;
  category: {
    name: string;
    slug: string;
  } | null;
};

export type PostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishDate: Date | null;
  createdAt: Date;
  readingTime: number | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
};

export type GetPostsResult = {
  posts: PostListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Cached query functions
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
  { revalidate: 60 }
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
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  },
  ['blog-post'],
  { revalidate: 60 }
);

const getCachedAllCategories = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return categories.map((cat) => ({
      ...cat,
      postCount: cat._count.posts,
    }));
  },
  ['blog-categories'],
  { revalidate: 300, tags: ['blog-categories'] }
);

const getCachedPostVersions = unstable_cache(
  async (postId: string) => {
    return prisma.postVersion.findMany({
      where: { postId },
      orderBy: { version: 'desc' },
    });
  },
  ['post-versions'],
  { revalidate: 30, tags: ['post-versions'] }
);

const getCachedPostVersion = unstable_cache(
  async (postId: string, version: number) => {
    return prisma.postVersion.findUnique({
      where: {
        postId_version: {
          postId,
          version,
        },
      },
    });
  },
  ['post-version'],
  { revalidate: 30, tags: ['post-version'] }
);

// Public API using cached functions
export async function getPosts({
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
} = {}): Promise<GetPostsResult> {
  return getCachedPosts({ published, featured, categoryId, page, limit });
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return getCachedPostBySlug(slug);
}

export async function getAllCategories(): Promise<(Category & { postCount: number })[]> {
  return getCachedAllCategories();
}

export async function getPostVersions(postId: string): Promise<PostVersion[]> {
  return getCachedPostVersions(postId);
}

export async function getPostVersion(
  postId: string,
  version: number
): Promise<PostVersion | null> {
  return getCachedPostVersion(postId, version);
}
