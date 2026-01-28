// Server Actions for comments system
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { commentSchema, type CommentInput } from '@/lib/validations';
import type { Comment, CommentStatus } from '@/generated/prisma/client';
import { cookies } from 'next/headers';

// Rate limiting: store IP + timestamp in memory or use a proper rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_COMMENTS_PER_WINDOW = 5;

function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ipAddress);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ipAddress, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_COMMENTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

async function getClientIp(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('clientIp')?.value || 'unknown';
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
  const where: any = {};

  if (postId) where.postId = postId;
  if (projectId) where.projectId = projectId;
  if (status !== 'ALL') where.status = status;
  where.parentId = null; // Only get top-level comments

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
  const where: any = {};
  if (postId) where.postId = postId;
  if (projectId) where.projectId = projectId;
  where.status = status;
  where.parentId = null;

  return prisma.comment.count({ where });
}

// =========================================
// MUTATION ACTIONS
// =========================================

export async function createComment(data: CommentInput & { ipAddress?: string; userAgent?: string }) {
  const validationResult = commentSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { postId, projectId, consent, ...commentData } = validationResult.data;

  if (!postId && !projectId) {
    return {
      success: false,
      error: 'Comment must be associated with a post or project',
    };
  }

  const ipAddress = data.ipAddress || await getClientIp();

  if (!checkRateLimit(ipAddress)) {
    return {
      success: false,
      error: 'Too many comments. Please try again later.',
    };
  }

  const comment = await prisma.comment.create({
    data: {
      ...commentData,
      postId,
      projectId,
      ipAddress,
      userAgent: data.userAgent,
      status: 'PENDING',
    },
  });

  revalidatePath(postId ? `/blog/${postId}` : `/projects/${projectId}`);

  return {
    success: true,
    comment,
    message: 'Comment submitted for moderation',
  };
}

export async function updateCommentStatus(
  id: string,
  status: CommentStatus
) {
  const comment = await prisma.comment.update({
    where: { id },
    data: { status },
  });

  const revalidatePath = comment.postId
    ? `/blog/${comment.postId}`
    : `/projects/${comment.projectId}`;

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

  revalidatePath(comment.postId || '/projects');

  return { success: true };
}

export async function updateComment(
  id: string,
  data: { content?: string }
) {
  const comment = await prisma.comment.update({
    where: { id },
    data: {
      ...data,
      status: 'PENDING', // Reset to pending on edit
    },
  });

  revalidatePath(comment.postId || '/projects');

  return comment;
}
