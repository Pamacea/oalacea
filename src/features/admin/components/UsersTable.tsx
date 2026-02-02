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
import { Search, Check, X, Mail } from "lucide-react"
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
  ADMIN: "border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson",
  EDITOR: "border-imperium-gold bg-imperium-gold/20 text-imperium-gold",
  AUTHOR: "border-imperium-steel bg-imperium-steel/20 text-imperium-bone",
  VIEWER: "border-imperium-steel-dark bg-imperium-steel-dark/20 text-imperium-steel",
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const permissions = usePermissions()
  const can = permissions.can
  const isAdmin = permissions.role === "ADMIN"
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
    if (!can("users:write")) return

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
    } catch {
      // Error silently ignored
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
    } catch {
      // Error silently ignored
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
    } catch {
      // Error silently ignored
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
    <Card variant="steel">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-imperium-steel" />
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
              {can("posts:write") && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 font-terminal text-imperium-steel-dark">
                  {'>'} No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="border-2 border-imperium-steel-dark">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="font-display bg-imperium-iron">
                          {getInitials(user.name || "", user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-display text-sm uppercase tracking-wider text-imperium-bone">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="font-terminal text-sm text-imperium-steel">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {can("posts:write") ? (
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
                      <Badge className={cn("rounded-none", roleColors[user.role])}>
                        {user.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "rounded-none gap-1",
                          user.isActive
                            ? "border-imperium-steel bg-imperium-steel/20 text-imperium-bone"
                            : "border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson"
                        )}
                      >
                        {user.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {!user.emailVerified && isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 font-terminal uppercase text-xs rounded-none"
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
                    <div className="flex gap-2 font-terminal text-sm text-imperium-steel">
                      <span>{user._count.createdPosts} posts</span>
                      <span>{user._count.createdProjects} projects</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (
                      <span className="font-terminal text-sm text-imperium-steel">
                        {format(new Date(user.lastLoginAt), "PPp")}
                      </span>
                    ) : (
                      <span className="font-terminal text-sm text-imperium-steel-dark">Never</span>
                    )}
                  </TableCell>
                  {can("posts:write") && (
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
