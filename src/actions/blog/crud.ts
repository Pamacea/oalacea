// Server Actions for blog CRUD operations
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { NotFoundError } from '@/core/errors';

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
    throw new NotFoundError('Post', slug);
  }

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

  const newSlug = data.slug || slug;

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  if (newSlug !== slug) {
    revalidatePath(`/blog/${newSlug}`);
  }

  return post;
}

export async function deletePost(slug: string) {
  await prisma.post.delete({
    where: { slug },
  });

  revalidatePath('/blog');

  return { success: true };
}

export async function deletePostWithRevalidate(slug: string) {
  await prisma.post.delete({
    where: { slug },
  });

  revalidatePath('/blog');
  revalidatePath('/admin/blog');

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
