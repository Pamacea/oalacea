import { logActivity } from "@/lib/activity-log"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, action, entityType, entityId, description, metadata, ipAddress, userAgent } = body

  if (!action || !entityType) {
    return NextResponse.json({ error: "action and entityType are required" }, { status: 400 })
  }

  const activity = await logActivity({
    userId,
    action,
    entityType,
    entityId,
    description,
    metadata,
    ipAddress,
    userAgent,
  })

  return NextResponse.json(activity, { status: 201 })
}
