// Server Actions for blog post version management
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/core/errors';

/**
 * Create a version snapshot before updating a post
 */
export async function createPostVersion(postId: string, changeNote?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('Post', postId);
  }

  const latestVersion = await prisma.postVersion.findFirst({
    where: { postId },
    orderBy: { version: 'desc' },
  });

  const newVersionNumber = (latestVersion?.version ?? 0) + 1;

  const version = await prisma.postVersion.create({
    data: {
      postId,
      version: newVersionNumber,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      tags: post.tags,
      changeNote,
    },
  });

  return version;
}

/**
 * Update post with version tracking
 */
export async function updatePostWithVersion(
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

  // Create version snapshot before updating
  await createPostVersion(existingPost.id, data.changeNote);

  // Update the post
  const { ...updateData } = data;

  const post = await prisma.post.update({
    where: { slug },
    data: {
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.slug && { slug: updateData.slug }),
      ...(updateData.excerpt !== undefined && { excerpt: updateData.excerpt }),
      ...(updateData.content && { content: updateData.content }),
      ...(updateData.categoryId && { categoryId: updateData.categoryId }),
      ...(updateData.coverImage !== undefined && { coverImage: updateData.coverImage }),
      ...(updateData.tags && { tags: updateData.tags }),
      ...(updateData.featured !== undefined && { featured: updateData.featured }),
      ...(updateData.publishDate && { publishDate: new Date(updateData.publishDate) }),
      ...(updateData.published !== undefined && { published: updateData.published }),
      metaTitle: updateData.metaTitle,
      metaDescription: updateData.metaDescription,
    },
  });

  const newSlug = updateData.slug || slug;

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  if (newSlug !== slug) {
    revalidatePath(`/blog/${newSlug}`);
  }

  return post;
}

/**
 * Restore a post from a previous version
 */
export async function restorePostVersion(
  slug: string,
  versionNumber: number,
  changeNote?: string
) {
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    throw new NotFoundError('Post', slug);
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
    throw new NotFoundError('PostVersion', `${post.id}:${versionNumber}`);
  }

  // Create version snapshot of current state before restoring
  await createPostVersion(post.id, changeNote || `Before restoring from version ${versionNumber}`);

  // Restore the content from target version
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

/**
 * Delete all versions for a post
 */
export async function deletePostVersions(postId: string) {
  await prisma.postVersion.deleteMany({
    where: { postId },
  });

  return { success: true, count: true };
}

/**
 * Delete a specific version
 */
export async function deletePostVersion(postId: string, version: number) {
  await prisma.postVersion.delete({
    where: {
      postId_version: {
        postId,
        version,
      },
    },
  });

  return { success: true };
}
