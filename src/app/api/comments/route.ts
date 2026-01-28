import { prisma } from "@/lib/prisma"
import { auth } from "@/core/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  entityType: z.enum(["Post", "Project", "Version"]),
  entityId: z.string().cuid(),
  mentions: z.array(z.string().cuid()).optional(),
})

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get("entityType")
  const entityId = searchParams.get("entityId")
  const limit = searchParams.get("limit")
  const offset = searchParams.get("offset")

  const where: Record<string, unknown> = {}

  if (entityType) {
    where.entityType = entityType
  }
  if (entityId) {
    where.entityId = entityId
  }

  const comments = await prisma.$transaction(async (tx) => {
    const [items, total] = await Promise.all([
      tx.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit ? parseInt(limit) : 50,
        skip: offset ? parseInt(offset) : 0,
      }),
      tx.comment.count({ where }),
    ])

    return { items, total }
  })

  return NextResponse.json({ comments: comments.items, total: comments.total })
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = commentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 })
  }

  const { content, entityType, entityId, mentions } = parsed.data

  const comment = await prisma.collaborativeComment.create({
    data: {
      content,
      entityType,
      entityId,
      authorId: session.user.id,
      mentions: mentions || [],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (mentions && mentions.length > 0) {
    await prisma.notification.createMany({
      data: mentions.map((userId) => ({
        userId,
        type: "COMMENT_MENTION",
        title: "You were mentioned in a comment",
        message: `${session.user.name || session.user.email} mentioned you in a comment`,
        entityType,
        entityId: comment.id,
        link: `/admin/${entityType.toLowerCase()}s/${entityId}`,
      })),
    })
  }

  return NextResponse.json({ comment })
}
