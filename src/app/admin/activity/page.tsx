import { Suspense } from "react"
import { auth } from "@/core/auth"
import { redirect } from "next/navigation"
import { requirePermission } from "@/lib/rbac"
import { ActivityLog } from "@/components/admin/ActivityLog"

export default async function AdminActivityPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  try {
    requirePermission(session.user.role, "activity:read")
  } catch {
    redirect("/admin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Log</h1>
        <p className="text-slate-500">Track all user actions and system events</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ActivityLog />
      </Suspense>
    </div>
  )
}
