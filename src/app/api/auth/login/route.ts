import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials", details: parsed.error.issues }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      password: true,
      role: true,
      isActive: true,
      emailVerified: true,
    },
  })

  if (!user || !user.password || !user.isActive) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const isValidPassword = await compare(password, user.password)
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    },
  })
}
