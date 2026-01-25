// Server Actions pour le blog - Using Prisma in Server Components
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Category, Post } from '@/generated/prisma/client';

// =========================================
// GET ACTIONS
// =========================================

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
} = {}) {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (published) where.published = true;
  if (featured) where.featured = true;
  if (categoryId) where.categoryId = categoryId;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { category: true },
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

export async function getPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!post) {
    return null;
  }

  return post;
}

export async function getAllCategories(): Promise<(Category & { postCount: number })[]> {
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
}

// =========================================
// MUTATION ACTIONS
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
      publishDate: data.publishDate ? new Date(data.publishDate) : null,
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
  }
) {
  const post = await prisma.post.update({
    where: { slug },
    data: {
      ...(data.title && { title: data.title }),
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

  return post;
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
