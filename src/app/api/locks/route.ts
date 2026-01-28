import { auth } from "@/core/auth"
import { acquireLock, releaseLock, getLock, getAllActiveLocks, cleanupExpiredLocks, forceReleaseLock } from "@/lib/contentLock"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get("entityType")
  const entityId = searchParams.get("entityId")
  const all = searchParams.get("all") === "true"
  const cleanup = searchParams.get("cleanup") === "true"

  if (cleanup && session.user.role === "ADMIN") {
    const count = await cleanupExpiredLocks()
    return NextResponse.json({ cleaned: count })
  }

  if (all) {
    const locks = await getAllActiveLocks()
    return NextResponse.json(locks)
  }

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId are required" }, { status: 400 })
  }

  const lock = await getLock(entityType, entityId)

  return NextResponse.json({ lock })
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { entityType, entityId, durationMinutes } = body

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId are required" }, { status: 400 })
  }

  const result = await acquireLock(
    entityType,
    entityId,
    session.user.id,
    durationMinutes
  )

  if (!result.success) {
    return NextResponse.json(result, { status: 409 })
  }

  return NextResponse.json(result)
}

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get("entityType")
  const entityId = searchParams.get("entityId")
  const lockId = searchParams.get("lockId")
  const force = searchParams.get("force") === "true"

  if (force && lockId && session.user.role === "ADMIN") {
    const success = await forceReleaseLock(lockId)
    return NextResponse.json({ success })
  }

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId are required" }, { status: 400 })
  }

  const success = await releaseLock(entityType, entityId, session.user.id)

  if (!success) {
    return NextResponse.json({ error: "Lock not found or owned by another user" }, { status: 404 })
  }

  return NextResponse.json({ success })
}

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { lockId, durationMinutes } = body

  if (!lockId) {
    return NextResponse.json({ error: "lockId is required" }, { status: 400 })
  }

  const result = await refreshLock(lockId, session.user.id, durationMinutes)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}

async function refreshLock(lockId: string, userId: string, durationMinutes?: number) {
  const { refreshLock: refresh } = await import("@/lib/contentLock")
  return refresh(lockId, userId, durationMinutes)
}
