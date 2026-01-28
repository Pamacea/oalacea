// Server Actions pour le blog - Using Prisma in Server Components
'use server';

import { revalidatePath, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Category, Post, PostVersion } from '@/generated/prisma/client';

type PostListItem = {
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

type PostDetail = {
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

type GetPostsResult = {
  posts: PostListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// =========================================
// GET ACTIONS (cached with unstable_cache)
// =========================================

const getCachedPosts = unstable_cache(
  async ({ published, featured, categoryId, page, limit }: {
    published: boolean;
    featured?: boolean;
    categoryId?: string;
    page: number;
    limit: number;
  }) => {
    const skip = (page - 1) * limit;
    const where: any = {};
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

// =========================================
// MUTATION ACTIONS (invalidate cache)
// =========================================

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  coverImage?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  publishDate?: string | Date;
  metaTitle?: string;
  metaDescription?: string;
}) {
  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      categoryId: data.categoryId,
      coverImage: data.coverImage,
      tags: data.tags,
      featured: data.featured || false,
      published: data.published ?? false,
      publishDate: data.publishDate ? new Date(data.publishDate) : (data.published ? new Date() : null),
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    },
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);

  return post;
}

export async function updatePost(
  slug: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    categoryId?: string;
    coverImage?: string;
    tags?: string[];
    featured?: boolean;
    publishDate?: string | Date;
    published?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    changeNote?: string;
  }
) {
  const existingPost = await prisma.post.findUnique({
    where: { slug },
  });

  if (!existingPost) {
    throw new Error('Post not found');
  }

  const latestVersion = await prisma.postVersion.findFirst({
    where: { postId: existingPost.id },
    orderBy: { version: 'desc' },
  });

  const newVersionNumber = (latestVersion?.version ?? 0) + 1;

  await prisma.postVersion.create({
    data: {
      postId: existingPost.id,
      version: newVersionNumber,
      title: existingPost.title,
      excerpt: existingPost.excerpt,
      content: existingPost.content,
      coverImage: existingPost.coverImage,
      tags: existingPost.tags,
      changeNote: data.changeNote,
    },
  });

  const newSlug = data.slug || slug;

  const post = await prisma.post.update({
    where: { slug },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.slug && { slug: data.slug }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.content && { content: data.content }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.tags && { tags: data.tags }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.publishDate && { publishDate: new Date(data.publishDate) }),
      ...(data.published !== undefined && { published: data.published }),
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    },
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  if (newSlug !== slug) {
    revalidatePath(`/blog/${newSlug}`);
  }

  return post;
}

export async function restorePostVersion(
  slug: string,
  versionNumber: number,
  changeNote?: string
) {
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  const targetVersion = await prisma.postVersion.findUnique({
    where: {
      postId_version: {
        postId: post.id,
        version: versionNumber,
      },
    },
  });

  if (!targetVersion) {
    throw new Error('Version not found');
  }

  const latestVersion = await prisma.postVersion.findFirst({
    where: { postId: post.id },
    orderBy: { version: 'desc' },
  });

  const newVersionNumber = (latestVersion?.version ?? 0) + 1;

  await prisma.postVersion.create({
    data: {
      postId: post.id,
      version: newVersionNumber,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      tags: post.tags,
      changeNote: changeNote || `Restored from version ${versionNumber}`,
    },
  });

  const restoredPost = await prisma.post.update({
    where: { slug },
    data: {
      title: targetVersion.title,
      excerpt: targetVersion.excerpt,
      content: targetVersion.content,
      coverImage: targetVersion.coverImage,
      tags: targetVersion.tags,
    },
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);

  return restoredPost;
}

export async function deletePost(slug: string) {
  await prisma.post.delete({
    where: { slug },
  });

  revalidatePath('/blog');

  return { success: true };
}

// =========================================
// CATEGORY ACTIONS
// =========================================

export async function createCategory(data: { name: string; slug: string }) {
  const category = await prisma.category.create({
    data: { name: data.name, slug: data.slug },
  });

  revalidatePath('/blog');
  revalidatePath('/admin/blog');

  return category;
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string }
) {
  const category = await prisma.category.update({
    where: { id },
    data,
  });

  revalidatePath('/blog');
  revalidatePath('/admin/blog');

  return category;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id },
  });

  revalidatePath('/blog');
  revalidatePath('/admin/blog');

  return { success: true };
}
