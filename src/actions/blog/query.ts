// Server Actions for blog queries (GET operations)
'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Category, PostVersion, Prisma } from '@/generated/prisma/client';

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
  featured: boolean;
  published: boolean;
  category: {
    id: string;
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

// Query functions - using unstable_cache but with admin bypass
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
  { revalidate: 60, tags: ['blog-posts'] }
);

// Uncached version for admin - bypasses cache entirely
export async function getPostsUncached({
  published,
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
  const skip = (page - 1) * limit;
  const where: Prisma.PostWhereInput = {};
  if (published !== undefined) where.published = published;
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
}

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
  { revalidate: 60, tags: ['blog-posts'] }
);

const getCachedPostById = unstable_cache(
  async (id: string) => {
    return prisma.post.findUnique({
      where: { id },
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
  ['blog-post-by-id'],
  { revalidate: 60, tags: ['blog-posts'] }
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

// Uncached version for admin - bypasses cache entirely
export async function getAllCategoriesUncached({ type }: { type?: 'BLOG' | 'PROJECT' } = {}): Promise<(Category & { postCount: number; projectCount: number })[]> {
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
}

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

export async function getPostById(id: string): Promise<PostDetail | null> {
  return getCachedPostById(id);
}

export async function getAllCategories({ type }: { type?: 'BLOG' | 'PROJECT' } = {}): Promise<(Category & { postCount: number; projectCount: number })[]> {
  return getCachedAllCategories({ type });
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
