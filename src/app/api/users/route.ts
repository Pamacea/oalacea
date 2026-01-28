import { auth } from "@/core/auth"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"
import { registerSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role") as UserRole | null
  const isActive = searchParams.get("isActive")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {}

  if (role) {
    where.role = role
  }

  if (isActive !== null) {
    where.isActive = isActive === "true"
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
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
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const { email, name, password } = parsed.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 })
  }

  const hashedPassword = await hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: body.role || "VIEWER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  return NextResponse.json(user, { status: 201 })
}
