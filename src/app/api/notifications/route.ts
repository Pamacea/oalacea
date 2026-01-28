import { prisma } from "@/lib/prisma"
import { auth } from "@/core/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get("unreadOnly") === "true"
  const limit = searchParams.get("limit")

  const where: Record<string, unknown> = {
    userId: session.user.id,
  }

  if (unreadOnly) {
    where.read = false
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit ? parseInt(limit) : 20,
  })

  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { ids, read, all } = body

  if (all) {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  }

  if (ids && Array.isArray(ids)) {
    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
      data: {
        read: read !== undefined ? read : true,
        readAt: read !== undefined && read === false ? null : new Date(),
      },
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const all = searchParams.get("all") === "true"
  const read = searchParams.get("read") === "true"

  if (all) {
    await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        ...(read ? { read: true } : {}),
      },
    })

    return NextResponse.json({ success: true })
  }

  if (id) {
    await prisma.notification.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
