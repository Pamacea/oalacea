"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Download, Filter, Trash2 } from "lucide-react"
import { usePermissions } from "@/features/auth/hooks"

interface Activity {
  id: string
  createdAt: Date
  action: string
  entityType: string
  entityId: string | null
  description: string | null
  ipAddress: string | null
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
}

interface ActivityLogProps {
  userId?: string
  entityType?: string
  entityId?: string
  className?: string
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-500/10 text-green-700 dark:text-green-400",
  UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
  PUBLISH: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  UNPUBLISH: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  LOGIN: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  LOGOUT: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  LOCK: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  UNLOCK: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  EXPORT: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
}

export function ActivityLog({ userId, entityType, entityId, className }: ActivityLogProps) {
  const permissions = usePermissions()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: "",
    entityType: entityType || "",
    userId: userId || "",
    startDate: "",
    endDate: "",
  })
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [exporting, setExporting] = useState(false)

  const canReadActivity = permissions.hasPermission("view")
  const canDelete = permissions.hasPermission("delete")

  useEffect(() => {
    if (canReadActivity) {
      fetchActivities()
    }
  }, [page, filters, canReadActivity])

  async function fetchActivities() {
    if (!canReadActivity) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: String(page * 50),
      })

      if (filters.action) params.set("action", filters.action)
      if (filters.entityType) params.set("entityType", filters.entityType)
      if (filters.userId) params.set("userId", filters.userId)
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)

      const response = await fetch(`/api/activity?${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
        setTotal(data.total)
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const params = new URLSearchParams({ export: "csv" })
      if (filters.action) params.set("action", filters.action)
      if (filters.entityType) params.set("entityType", filters.entityType)
      if (filters.userId) params.set("userId", filters.userId)
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)

      const response = await fetch(`/api/activity?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `activity-log-${new Date().toISOString()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to export activities:", error)
    } finally {
      setExporting(false)
    }
  }

  async function handleCleanup() {
    if (!confirm("Delete activity logs older than 90 days?")) return

    try {
      const response = await fetch("/api/activity", { method: "DELETE" })
      if (response.ok) {
        fetchActivities()
      }
    } catch (error) {
      console.error("Failed to cleanup logs:", error)
    }
  }

  if (!canReadActivity) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-500">You don't have permission to view activity logs.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Track all user actions and system events</CardDescription>
          </div>
          <div className="flex gap-2">
            {canDelete && (
              <Button variant="outline" size="sm" onClick={handleCleanup}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Up
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filter-action">Action</Label>
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters({ ...filters, action: value })}
            >
              <SelectTrigger id="filter-action">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="PUBLISH">Publish</SelectItem>
                <SelectItem value="UNPUBLISH">Unpublish</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="LOCK">Lock</SelectItem>
                <SelectItem value="UNLOCK">Unlock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filter-start">Start Date</Label>
            <Input
              id="filter-start"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filter-end">End Date</Label>
            <Input
              id="filter-end"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          {(filters.action || filters.startDate || filters.endDate) && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ action: "", entityType: "", userId: "", startDate: "", endDate: "" })}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No activity found</div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
                >
                  <Badge
                    variant="secondary"
                    className={actionColors[activity.action] || "bg-slate-500/10 text-slate-700"}
                  >
                    {activity.action}
                  </Badge>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.user?.name || "Unknown user"}</span>
                      {activity.user?.email && (
                        <span className="text-sm text-slate-500">({activity.user.email})</span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activity.description || `${activity.action.toLowerCase()} ${activity.entityType}`}
                      {activity.entityId && (
                        <span className="text-slate-500"> #{activity.entityId.slice(0, 8)}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <time dateTime={activity.createdAt.toISOString()}>
                        {format(new Date(activity.createdAt), "PPp")}
                      </time>
                      {activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {total > 50 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-slate-500">
              Showing {page * 50 + 1}-{Math.min((page + 1) * 50, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * 50 >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
