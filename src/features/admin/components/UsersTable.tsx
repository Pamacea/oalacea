"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Shield, Check, X, Mail } from "lucide-react"
import { usePermissions } from "@/features/auth/hooks"
import { cn } from "@/lib/utils"

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  isActive: boolean
  emailVerified: Date | null
  createdAt: Date
  lastLoginAt: Date | null
  _count: {
    createdPosts: number
    createdProjects: number
  }
}

interface UsersTableProps {
  users: User[]
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-700 dark:text-red-400",
  EDITOR: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  AUTHOR: "bg-green-500/10 text-green-700 dark:text-green-400",
  VIEWER: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const permissions = usePermissions()
  const can = permissions.hasPermission
  const isAdmin = permissions.userRole === "admin"
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [updating, setUpdating] = useState<string | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  async function updateRole(userId: string, newRole: string) {
    if (!can("edit")) return

    setUpdating(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
      }
    } catch (error) {
      console.error("Failed to update role:", error)
    } finally {
      setUpdating(null)
    }
  }

  async function toggleActive(userId: string, isActive: boolean) {
    if (!isAdmin) return

    setUpdating(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
        )
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
    } finally {
      setUpdating(null)
    }
  }

  async function verifyEmail(userId: string) {
    if (!isAdmin) return

    setUpdating(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailVerified: new Date().toISOString() }),
      })

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, emailVerified: new Date() } : u))
        )
      }
    } catch (error) {
      console.error("Failed to verify email:", error)
    } finally {
      setUpdating(null)
    }
  }

  function getInitials(name: string, email: string) {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : email[0].toUpperCase()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
              <SelectItem value="AUTHOR">Author</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Last Login</TableHead>
              {can("edit") && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>{getInitials(user.name || "", user.email)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || "Unnamed User"}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {can("edit") ? (
                      <Select
                        value={user.role}
                        disabled={updating === user.id}
                        onValueChange={(newRole) => updateRole(user.id, newRole)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="AUTHOR">Author</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                        className={cn(
                          "gap-1",
                          user.isActive
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-red-500/10 text-red-700 dark:text-red-400"
                        )}
                      >
                        {user.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {!user.emailVerified && isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => verifyEmail(user.id)}
                          disabled={updating === user.id}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 text-sm text-slate-500">
                      <span>{user._count.createdPosts} posts</span>
                      <span>{user._count.createdProjects} projects</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (
                      <span className="text-sm text-slate-500">
                        {format(new Date(user.lastLoginAt), "PPp")}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Never</span>
                    )}
                  </TableCell>
                  {can("edit") && (
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(user.id, user.isActive)}
                        disabled={updating === user.id || user.id === "current-user-id"}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
