import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return NextResponse.json({ success: true }, { status: 200 })
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  })

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 3600000)

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expires,
    },
  })

  return NextResponse.json({
    success: true,
    message: "If an account exists with this email, a password reset link has been sent.",
  })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { token, password } = body

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }

  const { hash } = await import("bcryptjs")
  const hashedPassword = await hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ])

  return NextResponse.json({ success: true })
}
