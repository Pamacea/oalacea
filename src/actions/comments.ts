// Server Actions for comments system
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { commentSchema, type CommentInput } from '@/lib/validations';
import { sanitizeHtml } from '@/lib/sanitize';
import { auth } from '@/core/auth';
import { requirePermission, AuthorizationError } from '@/lib/rbac';
import { headers } from 'next/headers';
import { RateLimitError } from '@/core/errors';
import type { Comment, CommentStatus, Prisma } from '@/generated/prisma/client';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_COMMENTS_PER_WINDOW = 5;

/**
 * Extract real client IP from request headers
 * Handles various proxy/load balancer configurations
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Try various headers in order of reliability
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfConnectingIp = headersList.get('cf-connecting-ip'); // Cloudflare
  const flyClientIp = headersList.get('fly-client-ip'); // Fly.io
  const xClientIp = headersList.get('x-client-ip');

  // x-forwarded-for can contain multiple IPs, use the first one (original client)
  const ip = forwardedFor?.split(',')[0]?.trim()
    || cfConnectingIp
    || flyClientIp
    || realIp
    || xClientIp
    || '0.0.0.0'; // Fallback for local dev

  // Basic validation - prevent injection via headers
  if (!ip || ip === 'unknown' || !/^[a-fA-F0-9.:]+$/.test(ip)) {
    return '0.0.0.0';
  }

  return ip;
}

async function checkRateLimit(ipAddress: string): Promise<void> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const recentCount = await prisma.comment.count({
    where: {
      ipAddress,
      createdAt: { gte: windowStart },
    } as Prisma.CommentWhereInput,
  });

  if (recentCount >= MAX_COMMENTS_PER_WINDOW) {
    throw new RateLimitError(`Too many comments. Maximum ${MAX_COMMENTS_PER_WINDOW} per hour.`);
  }
}

// =========================================
// GET ACTIONS
// =========================================

export async function getComments({
  postId,
  projectId,
  status = 'APPROVED',
  includeReplies = true,
}: {
  postId?: string;
  projectId?: string;
  status?: CommentStatus | 'ALL';
  includeReplies?: boolean;
} = {}): Promise<Comment[]> {
  const where: Prisma.CommentWhereInput = {
    parentId: null, // Only get top-level comments
  };

  if (postId) where.postId = postId;
  if (projectId) where.projectId = projectId;
  if (status !== 'ALL') where.status = status;

  const comments = await prisma.comment.findMany({
    where,
    include: {
      replies: includeReplies ? {
        where: status !== 'ALL' ? { status } : undefined,
        orderBy: { createdAt: 'asc' },
      } : false,
      post: { select: { id: true, slug: true, title: true } },
      project: { select: { id: true, slug: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return comments;
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      replies: true,
      post: true,
      project: true,
    },
  });

  return comment;
}

export async function getPendingComments({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { status: 'PENDING' },
      include: {
        post: { select: { id: true, slug: true, title: true } },
        project: { select: { id: true, slug: true, title: true } },
        parent: { select: { id: true, authorName: true, content: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCommentsCount({
  postId,
  projectId,
  status = 'APPROVED',
}: {
  postId?: string;
  projectId?: string;
  status?: CommentStatus;
} = {}): Promise<number> {
  const where: Prisma.CommentWhereInput = {
    status,
    parentId: null,
  };

  if (postId) where.postId = postId;
  if (projectId) where.projectId = projectId;

  return prisma.comment.count({ where });
}

// =========================================
// MUTATION ACTIONS
// =========================================

/**
 * Wrapper for form submission - extracts data from FormData
 * Compatible with native HTML form submission
 */
export async function createCommentAction(
  prevState: { success?: boolean; error?: string; errors?: Record<string, string[]> } | undefined,
  formData: FormData
) {
  // Helper: FormData.get() returns null for missing fields, convert to undefined
  const nullToUndefined = <T,>(value: T | null): T | undefined =>
    value === null ? undefined : value

  // Helper: For optional email, convert null to empty string (schema allows empty string)
  const nullToEmptyString = (value: FormDataEntryValue | null): string =>
    value === null ? '' : String(value)

  const rawData = {
    authorName: formData.get('authorName'),
    authorEmail: nullToEmptyString(formData.get('authorEmail')),
    content: formData.get('content'),
    consent: formData.get('consent') === 'on',
    postId: nullToUndefined(formData.get('postId')),
    projectId: nullToUndefined(formData.get('projectId')),
    parentId: nullToUndefined(formData.get('parentId')),
  }

  const result = await createComment(rawData as CommentInput & { userAgent?: string })

  return result
}

export async function createComment(data: CommentInput & { userAgent?: string }) {
  const validationResult = commentSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { postId, projectId, parentId, content, consent, authorEmail, ...commentData } = validationResult.data;

  if (!postId && !projectId) {
    return {
      success: false,
      error: 'Comment must be associated with a post or project',
    };
  }

  // SECURITY: Validate parent comment belongs to same post/project
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true, projectId: true, parentId: true },
    });

    if (!parentComment) {
      return {
        success: false,
        error: 'Parent comment not found',
      };
    }

    // Verify parent belongs to the same post/project
    if (postId && parentComment.postId !== postId) {
      return {
        success: false,
        error: 'Parent comment does not belong to this post',
      };
    }

    if (projectId && parentComment.projectId !== projectId) {
      return {
        success: false,
        error: 'Parent comment does not belong to this project',
      };
    }

    // Enforce max depth of 3 levels on server side
    if (parentComment.parentId) {
      // Parent is already a reply, check if it's a reply to a reply
      const grandParent = await prisma.comment.findUnique({
        where: { id: parentComment.parentId },
        select: { postId: true, projectId: true, parentId: true },
      });

      if (grandParent?.parentId) {
        return {
          success: false,
          error: 'Maximum reply depth exceeded (3 levels)',
        };
      }
    }
  }

  const ipAddress = await getClientIp();

  try {
    await checkRateLimit(ipAddress);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return {
        success: false,
        error: error.message,
      };
    }
    throw error;
  }

  // SECURITY: Sanitize content to prevent XSS
  const sanitizedContent = sanitizeHtml(content);

  const comment = await prisma.comment.create({
    data: {
      ...commentData,
      content: sanitizedContent,
      postId,
      projectId,
      parentId,
      ipAddress,
      userAgent: data.userAgent,
      status: 'PENDING',
    },
  });

  // Fetch post/project slug for proper revalidation
  let revalidatePathValue = '/';
  if (postId) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { slug: true },
    });
    if (post) revalidatePathValue = `/blog/${post.slug}`;
  } else if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });
    if (project) revalidatePathValue = `/projects/${project.slug}`;
  }

  revalidatePath(revalidatePathValue);

  return {
    success: true,
    comment,
    message: 'Comment submitted for moderation',
  };
}

// Helper function for admin authorization
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthorizationError('You must be logged in');
  }

  requirePermission(session.user.role, 'comments:moderate');

  return session;
}

async function getRevalidationPath(commentId: string): Promise<string> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { postId: true, projectId: true },
  });

  if (!comment) return '/';

  if (comment.postId) {
    const post = await prisma.post.findUnique({
      where: { id: comment.postId },
      select: { slug: true },
    });
    return post ? `/blog/${post.slug}` : '/';
  }

  if (comment.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: comment.projectId },
      select: { slug: true },
    });
    return project ? `/projects/${project.slug}` : '/';
  }

  return '/';
}

export async function updateCommentStatus(
  id: string,
  status: CommentStatus
) {
  await requireAdmin();

  const comment = await prisma.comment.update({
    where: { id },
    data: { status },
  });

  const revalidatePathValue = await getRevalidationPath(id);
  revalidatePath(revalidatePathValue);

  return comment;
}

export async function approveComment(id: string) {
  return updateCommentStatus(id, 'APPROVED');
}

export async function rejectComment(id: string) {
  return updateCommentStatus(id, 'REJECTED');
}

export async function markCommentAsSpam(id: string) {
  return updateCommentStatus(id, 'SPAM');
}

export async function deleteComment(id: string) {
  await requireAdmin();

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { postId: true, projectId: true },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  await prisma.comment.delete({
    where: { id },
  });

  const revalidatePathValue = await getRevalidationPath(id);
  revalidatePath(revalidatePathValue);

  return { success: true };
}

export async function updateComment(
  id: string,
  data: { content?: string }
) {
  await requireAdmin();

  const updateData: { content?: string; status: CommentStatus } = {
    status: 'PENDING', // Reset to pending on edit
  };

  if (data.content) {
    updateData.content = sanitizeHtml(data.content);
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: updateData,
  });

  const revalidatePathValue = await getRevalidationPath(id);
  revalidatePath(revalidatePathValue);

  return comment;
}
