import { prisma } from "@/lib/prisma"

export interface LockResult {
  success: boolean
  lock?: {
    id: string
    userId: string
    lockedAt: Date
    expiresAt: Date
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }
  error?: string
}

export async function acquireLock(
  entityType: string,
  entityId: string,
  userId: string,
  durationMinutes: number = 30
): Promise<LockResult> {
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000)

  const existingLock = await prisma.contentLock.findFirst({
    where: {
      entityType,
      entityId,
      isActive: true,
      OR: [
        { expiresAt: { gt: new Date() } },
        { userId },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (existingLock) {
    if (existingLock.userId === userId) {
      await prisma.contentLock.update({
        where: { id: existingLock.id },
        data: { expiresAt },
      })

      return {
        success: true,
        lock: {
          ...existingLock,
          expiresAt,
        },
      }
    }

    return {
      success: false,
      lock: existingLock,
      error: `Content is currently being edited by ${existingLock.user.name || existingLock.user.email}`,
    }
  }

  const lock = await prisma.contentLock.create({
    data: {
      entityType,
      entityId,
      userId,
      expiresAt,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  return { success: true, lock }
}

export async function releaseLock(
  entityType: string,
  entityId: string,
  userId: string
): Promise<boolean> {
  const lock = await prisma.contentLock.findFirst({
    where: {
      entityType,
      entityId,
      isActive: true,
    },
  })

  if (!lock) return false

  if (lock.userId !== userId) {
    return false
  }

  await prisma.contentLock.update({
    where: { id: lock.id },
    data: { isActive: false },
  })

  return true
}

export async function forceReleaseLock(lockId: string): Promise<boolean> {
  try {
    await prisma.contentLock.update({
      where: { id: lockId },
      data: { isActive: false },
    })
    return true
  } catch {
    return false
  }
}

export async function getLock(
  entityType: string,
  entityId: string
): Promise<LockResult["lock"] | null> {
  const lock = await prisma.contentLock.findFirst({
    where: {
      entityType,
      entityId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (!lock) return null

  return lock
}

export async function refreshLock(
  lockId: string,
  userId: string,
  durationMinutes: number = 30
): Promise<LockResult> {
  const lock = await prisma.contentLock.findUnique({
    where: { id: lockId },
  })

  if (!lock || !lock.isActive) {
    return { success: false, error: "Lock not found or expired" }
  }

  if (lock.userId !== userId) {
    return { success: false, error: "You don't own this lock" }
  }

  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000)

  const updated = await prisma.contentLock.update({
    where: { id: lockId },
    data: { expiresAt },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  return { success: true, lock: updated }
}

export async function cleanupExpiredLocks(): Promise<number> {
  const result = await prisma.contentLock.updateMany({
    where: {
      isActive: true,
      expiresAt: { lt: new Date() },
    },
    data: { isActive: false },
  })

  return result.count
}

export async function getUserActiveLocks(userId: string) {
  return prisma.contentLock.findMany({
    where: {
      userId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { lockedAt: "desc" },
  })
}

export async function getAllActiveLocks() {
  return prisma.contentLock.findMany({
    where: {
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { lockedAt: "desc" },
  })
}
