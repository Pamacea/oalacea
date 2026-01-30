"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, User, Calendar } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  emailVerified: Date | null
  createdAt: Date
  lastLoginAt: Date | null
}

interface ProfileFormProps {
  user: User
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-700 dark:text-red-400",
  EDITOR: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  AUTHOR: "bg-green-500/10 text-green-700 dark:text-green-400",
  VIEWER: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const { update } = useSession()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const response = await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name }),
        })

        if (response.ok) {
          await update({ name: formData.name })
          router.refresh()
        }
      } catch (error) {
        console.error("Failed to update profile:", error)
      }
    })
  }

  async function handleSendVerification() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
        })
        if (response.ok) {
          alert("Verification email sent!")
        }
      } catch (error) {
        console.error("Failed to send verification email:", error)
      }
    })
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
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-zinc-700"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100/50 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-zinc-500">Contact an admin to change your email</p>
            </div>

            <Button type="submit" disabled={isPending} className="bg-zinc-600 hover:bg-zinc-500">
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name || "", user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-zinc-100">{user.name || "Unnamed User"}</h3>
              <p className="text-sm text-zinc-500">{user.email}</p>
              <Badge variant="secondary" className={cn("mt-2", roleColors[user.role])}>
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-400">Email:</span>
              {user.emailVerified ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  Verified
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                    Not Verified
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleSendVerification}
                    disabled={isPending}
                  >
                    Verify
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-400">Role:</span>
              <span className="text-zinc-100">{user.role}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-400">Member since:</span>
              <span className="text-zinc-100">{format(new Date(user.createdAt), "MMM yyyy")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
