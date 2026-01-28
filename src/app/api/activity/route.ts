import { auth } from "@/core/auth"
import { getActivities, exportActivitiesToCsv, deleteOldLogs, getActivityStats } from "@/lib/activity-log"
import { checkPermission } from "@/lib/api-auth"
import { NextResponse } from "next/server"
import type { ActivityAction } from "@/generated/prisma/enums"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user || !checkPermission(session.user.role, "activity:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || undefined
  const action = searchParams.get("action") || undefined
  const entityType = searchParams.get("entityType") || undefined
  const entityId = searchParams.get("entityId") || undefined
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = searchParams.get("limit")
  const offset = searchParams.get("offset")
  const exportCsv = searchParams.get("export") === "csv"
  const stats = searchParams.get("stats")

  if (stats === "day" || stats === "week" || stats === "month") {
    const activityStats = await getActivityStats(stats)
    return NextResponse.json(activityStats)
  }

  if (exportCsv) {
    const csv = await exportActivitiesToCsv({
      userId,
      action: action as ActivityAction,
      entityType,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="activity-log-${new Date().toISOString()}.csv"`,
      },
    })
  }

  const result = await getActivities({
    userId,
    action: action as ActivityAction,
    entityType,
    entityId,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  })

  return NextResponse.json(result)
}

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session?.user || !checkPermission(session.user.role, "users:delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const days = searchParams.get("days")
  const daysToKeep = days ? parseInt(days) : 90

  const result = await deleteOldLogs(daysToKeep)

  return NextResponse.json({
    success: true,
    deleted: result.count,
  })
}
