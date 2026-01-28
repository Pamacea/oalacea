import { prisma } from "@/lib/prisma"
import { auth } from "@/core/auth"
import { NextResponse } from "next/server"
import { updateUserSchema } from "@/lib/validations"

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateUserSchema.partial().safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 })
  }

  const { name, emailVerified } = parsed.data

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (emailVerified !== undefined) updateData.emailVerified = new Date(emailVerified)

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
    },
  })

  return NextResponse.json({ user })
}

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user })
}
