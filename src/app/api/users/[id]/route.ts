import { auth } from "@/core/auth"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  if (session.user.role !== "ADMIN" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const isSelf = session.user.id === id
  const isAdmin = session.user.role === "ADMIN"

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const updateData: Record<string, unknown> = {}

  if (body.name) updateData.name = body.name
  if (body.image !== undefined) updateData.image = body.image

  if (body.email && isAdmin) {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    updateData.email = body.email
  }

  if (body.password && (isSelf || isAdmin)) {
    updateData.password = await hash(body.password, 12)
  }

  if (body.role && isAdmin) {
    updateData.role = body.role as UserRole
  }

  if (typeof body.isActive === "boolean" && isAdmin) {
    updateData.isActive = body.isActive
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })

  return NextResponse.json(user)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
  }

  await prisma.user.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
