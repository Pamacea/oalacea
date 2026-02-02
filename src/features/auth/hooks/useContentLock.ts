"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"

export interface ContentLock {
  id: string
  entityType: string
  entityId: string
  userId: string
  lockedAt: Date
  expiresAt: Date
  isActive: boolean
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export interface UseContentLockOptions {
  entityType: string
  entityId: string
  enabled?: boolean
  pollInterval?: number
  onLockAcquired?: () => void
  onLockLost?: () => void
  onLockConflict?: (lock: ContentLock) => void
}

export function useContentLock({
  entityType,
  entityId,
  enabled = true,
  pollInterval = 30000,
  onLockAcquired,
  onLockLost,
  onLockConflict,
}: UseContentLockOptions) {
  const { data: session } = useSession()
  const [lock, setLock] = useState<ContentLock | null>(null)
  const [isLockedByMe, setIsLockedByMe] = useState(false)
  const [isLockedByOthers, setIsLockedByOthers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLock = useCallback(async () => {
    if (!enabled) return

    try {
      const response = await fetch(`/api/locks?entityType=${entityType}&entityId=${entityId}`)
      if (response.ok) {
        const data = await response.json()
        const currentLock = data.lock

        const wasLockedByMe = isLockedByMe
        const wasLockedByOthers = isLockedByOthers

        setLock(currentLock)
        setIsLockedByMe(currentLock?.userId === session?.user?.id)
        setIsLockedByOthers(!!currentLock && currentLock.userId !== session?.user?.id)

        if (currentLock?.userId === session?.user?.id && !wasLockedByMe) {
          onLockAcquired?.()
        } else if (wasLockedByMe && currentLock?.userId !== session?.user?.id) {
          onLockLost?.()
        } else if (currentLock?.userId !== session?.user?.id && !wasLockedByOthers) {
          onLockConflict?.(currentLock)
        }
      }
    } catch {
      console.error("Failed to fetch lock status")
    }
  }, [enabled, entityType, entityId, session?.user?.id, isLockedByMe, isLockedByOthers, onLockAcquired, onLockLost, onLockConflict])

  const acquireLock = useCallback(async (durationMinutes: number = 30) => {
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, durationMinutes }),
      })

      const data = await response.json()

      if (data.success) {
        setLock(data.lock)
        setIsLockedByMe(true)
        setIsLockedByOthers(false)
        onLockAcquired?.()
        return { success: true, lock: data.lock }
      } else {
        setIsLockedByOthers(true)
        onLockConflict?.(data.lock)
        return data
      }
    } catch {
      return { success: false, error: "Failed to acquire lock" }
    } finally {
      setIsLoading(false)
    }
  }, [session, entityType, entityId, onLockAcquired, onLockConflict])

  const releaseLock = useCallback(async () => {
    if (!session?.user) {
      return { success: false }
    }

    try {
      const response = await fetch(`/api/locks?entityType=${entityType}&entityId=${entityId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setLock(null)
        setIsLockedByMe(false)
        setIsLockedByOthers(false)
        onLockLost?.()
      }

      return data
    } catch {
      return { success: false }
    }
  }, [session, entityType, entityId, onLockLost])

  const refreshLock = useCallback(async (durationMinutes: number = 30) => {
    if (!lock || !isLockedByMe) {
      return { success: false, error: "No lock to refresh" }
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/locks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockId: lock.id, durationMinutes }),
      })

      const data = await response.json()

      if (data.success) {
        setLock(data.lock)
        return { success: true, lock: data.lock }
      }

      return data
    } catch {
      return { success: false, error: "Failed to refresh lock" }
    } finally {
      setIsLoading(false)
    }
  }, [lock, isLockedByMe])

  const forceReleaseLock = useCallback(async (lockId: string) => {
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const response = await fetch(`/api/locks?lockId=${lockId}&force=true`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        await fetchLock()
      }

      return data
    } catch {
      return { success: false, error: "Failed to force release lock" }
    }
  }, [session, fetchLock])

  useEffect(() => {
    if (!enabled) return

    fetchLock()

    intervalRef.current = setInterval(fetchLock, pollInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, fetchLock, pollInterval])

  return {
    lock,
    isLockedByMe,
    isLockedByOthers,
    isLoading,
    acquireLock,
    releaseLock,
    refreshLock,
    forceReleaseLock,
    refetch: fetchLock,
  }
}
