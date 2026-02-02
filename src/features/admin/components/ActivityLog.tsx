"use client"

import { useCallback, useEffect, useState } from "react"
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
  CREATE: "bg-imperium-gold/10 text-imperium-gold border-imperium-gold/30",
  UPDATE: "bg-imperium-warp/10 text-imperium-warp border-imperium-warp/30",
  DELETE: "bg-imperium-crimson/10 text-imperium-crimson border-imperium-crimson/30",
  PUBLISH: "bg-imperium-iron/10 text-imperium-bone border-imperium-iron-dark",
  UNPUBLISH: "bg-imperium-steel/10 text-imperium-steel border-imperium-steel-dark",
  LOGIN: "bg-imperium-gold/10 text-imperium-gold border-imperium-gold/30",
  LOGOUT: "bg-imperium-steel/10 text-imperium-steel border-imperium-steel-dark",
  LOCK: "bg-imperium-crimson/10 text-imperium-crimson border-imperium-crimson/30",
  UNLOCK: "bg-imperium-gold/10 text-imperium-gold border-imperium-gold/30",
  EXPORT: "bg-imperium-warp/10 text-imperium-warp border-imperium-warp/30",
}

export function ActivityLog({ userId, entityType, className }: ActivityLogProps) {
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

  const canReadActivity = permissions.can("activity:read")
  const canDelete = permissions.can("users:delete") // Admins can delete via user management

  const fetchActivities = useCallback(async () => {
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
    } catch {
      // Error silently ignored
    } finally {
      setLoading(false)
    }
  }, [canReadActivity, page, filters])

  useEffect(() => {
    if (canReadActivity) {
      fetchActivities()
    }
  }, [canReadActivity, fetchActivities])

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
    } catch {
      // Error silently ignored
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
    } catch {
      // Error silently ignored
    }
  }

  if (!canReadActivity) {
    return (
      <Card variant="steel">
        <CardContent className="p-6">
          <p className="font-terminal text-imperium-steel-dark">{'>'} You don&apos;t have permission to view activity logs.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="steel" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display uppercase tracking-wider text-imperium-crimson">
              [ Activity Log ]
            </CardTitle>
            <CardDescription className="font-terminal text-imperium-steel-dark">
              {'>'} Track all user actions and system events
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {canDelete && (
              <Button variant="outline" size="sm" onClick={handleCleanup} className="border-imperium-steel-dark font-terminal text-imperium-bone hover:bg-imperium-iron">
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Up
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="border-imperium-steel-dark font-terminal text-imperium-bone hover:bg-imperium-iron">
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-imperium-gold" />
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
            <Label htmlFor="filter-action" className="font-display text-imperium-bone">Action</Label>
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters({ ...filters, action: value })}
            >
              <SelectTrigger id="filter-action" className="border-imperium-steel-dark bg-imperium-black font-terminal text-imperium-bone">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent className="border-imperium-steel-dark bg-imperium-black">
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
            <Label htmlFor="filter-start" className="font-display text-imperium-bone">Start Date</Label>
            <Input
              id="filter-start"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="border-imperium-steel-dark bg-imperium-black font-terminal text-imperium-bone"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="filter-end" className="font-display text-imperium-bone">End Date</Label>
            <Input
              id="filter-end"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="border-imperium-steel-dark bg-imperium-black font-terminal text-imperium-bone"
            />
          </div>

          {(filters.action || filters.startDate || filters.endDate) && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ action: "", entityType: "", userId: "", startDate: "", endDate: "" })}
                className="font-terminal text-imperium-steel hover:text-imperium-crimson"
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
              <Loader2 className="h-6 w-6 animate-spin text-imperium-gold" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 font-terminal text-imperium-steel-dark">
              {'>'} No activity found
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-none border-2 border-imperium-steel-dark bg-imperium-black"
                >
                  <Badge
                    variant="default"
                    className={actionColors[activity.action] || "border-imperium-steel-dark bg-imperium-iron text-imperium-steel"}
                  >
                    {activity.action}
                  </Badge>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display uppercase text-imperium-bone">{activity.user?.name || "Unknown user"}</span>
                      {activity.user?.email && (
                        <span className="font-terminal text-sm text-imperium-steel-dark">({activity.user.email})</span>
                      )}
                    </div>

                    <p className="font-terminal text-sm text-imperium-steel">
                      {activity.description || `${activity.action.toLowerCase()} ${activity.entityType}`}
                      {activity.entityId && (
                        <span className="text-imperium-steel-dark"> #{activity.entityId.slice(0, 8)}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-4 mt-1 font-terminal text-xs text-imperium-steel-dark">
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-imperium-steel-dark">
            <p className="font-terminal text-sm text-imperium-steel-dark">
              Showing {page * 50 + 1}-{Math.min((page + 1) * 50, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="border-imperium-steel-dark font-terminal text-imperium-bone hover:bg-imperium-iron"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * 50 >= total}
                onClick={() => setPage((p) => p + 1)}
                className="border-imperium-steel-dark font-terminal text-imperium-bone hover:bg-imperium-iron"
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
