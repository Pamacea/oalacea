import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { auth } from "@/core/auth"

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 })
  }

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  })

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 86400000)

  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId: user.id,
      expires,
    },
  })

  return NextResponse.json({
    success: true,
    message: "Verification email sent",
  })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { token } = body

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 })
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!verificationToken || verificationToken.used || verificationToken.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    }),
  ])

  return NextResponse.json({ success: true })
}
