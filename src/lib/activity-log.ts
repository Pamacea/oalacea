import { prisma } from "@/lib/prisma"
import type { ActivityAction } from "@/generated/prisma/enums"

export interface LogActivityParams {
  userId?: string
  action: ActivityAction
  entityType: string
  entityId?: string
  description?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logActivity(params: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
      metadata: (params.metadata || {}) as never,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  })
}

export async function getActivities(filters?: {
  userId?: string
  action?: ActivityAction
  entityType?: string
  entityId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const where: Record<string, unknown> = {}

  if (filters?.userId) {
    where.userId = filters.userId
  }

  if (filters?.action) {
    where.action = filters.action
  }

  if (filters?.entityType) {
    where.entityType = filters.entityType
  }

  if (filters?.entityId) {
    where.entityId = filters.entityId
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {} as never
    if (filters.startDate) {
      (where.createdAt as Record<string, unknown>).gte = filters.startDate
    }
    if (filters.endDate) {
      (where.createdAt as Record<string, unknown>).lte = filters.endDate
    }
  }

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.activityLog.count({ where }),
  ])

  return { activities, total }
}

export async function deleteOldLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  return prisma.activityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })
}

export async function exportActivitiesToCsv(filters?: {
  userId?: string
  action?: ActivityAction
  entityType?: string
  entityId?: string
  startDate?: Date
  endDate?: Date
}) {
  const { activities } = await getActivities({
    ...filters,
    limit: 10000,
  })

  const headers = [
    "ID",
    "Date",
    "User",
    "User Email",
    "Action",
    "Entity Type",
    "Entity ID",
    "Description",
    "IP Address",
  ]

  const rows = activities.map((activity) => [
    activity.id,
    activity.createdAt.toISOString(),
    activity.user?.name || "N/A",
    activity.user?.email || "N/A",
    activity.action,
    activity.entityType,
    activity.entityId || "N/A",
    activity.description || "",
    activity.ipAddress || "N/A",
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell)
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(",")
    ),
  ].join("\n")

  return csvContent
}

export async function getActivityStats(timeframe: "day" | "week" | "month" = "day") {
  const now = new Date()
  let startDate: Date

  switch (timeframe) {
    case "day":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
  }

  const activities = await prisma.activityLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      action: true,
      entityType: true,
      createdAt: true,
      userId: true,
    },
  })

  const actionCounts: Record<string, number> = {}
  const entityTypeCounts: Record<string, number> = {}
  const userActivityCounts: Record<string, number> = {}

  for (const activity of activities) {
    actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1
    entityTypeCounts[activity.entityType] = (entityTypeCounts[activity.entityType] || 0) + 1
    if (activity.userId) {
      userActivityCounts[activity.userId] = (userActivityCounts[activity.userId] || 0) + 1
    }
  }

  return {
    total: activities.length,
    byAction: actionCounts,
    byEntityType: entityTypeCounts,
    byUser: userActivityCounts,
  }
}
