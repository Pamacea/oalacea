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
  ADMIN: "border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson",
  EDITOR: "border-imperium-gold bg-imperium-gold/20 text-imperium-gold",
  AUTHOR: "border-imperium-steel bg-imperium-steel/20 text-imperium-bone",
  VIEWER: "border-imperium-steel-dark bg-imperium-steel-dark/20 text-imperium-steel",
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
      <Card variant="steel" className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-imperium-crimson">
            [ Profile Information ]
          </CardTitle>
          <CardDescription className="font-terminal text-imperium-steel">
            {'>'} Update your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-display text-imperium-bone">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email" className="font-display text-imperium-bone">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="cursor-not-allowed"
              />
              <p className="mt-1 font-terminal text-xs text-imperium-steel-dark">
                {'>'} Contact an admin to change your email
              </p>
            </div>

            <Button type="submit" disabled={isPending} variant="crimson">
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-imperium-bone" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card variant="iron">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-imperium-crimson">
              [ Your Profile ]
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-imperium-steel-dark">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="font-display text-imperium-bone bg-imperium-iron">
                {getInitials(user.name || "", user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-display text-sm uppercase tracking-wider text-imperium-bone">
                {user.name || "Unnamed User"}
              </h3>
              <p className="font-terminal text-sm text-imperium-steel">{user.email}</p>
              <Badge className={cn("mt-2 rounded-none", roleColors[user.role])}>
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card variant="iron">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-imperium-crimson text-sm">
              [ Account Status ]
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-imperium-steel" />
              <span className="font-terminal text-imperium-steel">Email:</span>
              {user.emailVerified ? (
                <Badge className="rounded-none border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson">
                  Verified
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge className="rounded-none border-imperium-gold bg-imperium-gold/20 text-imperium-gold">
                    Not Verified
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 font-terminal uppercase text-xs rounded-none"
                    onClick={handleSendVerification}
                    disabled={isPending}
                  >
                    Verify
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-imperium-steel" />
              <span className="font-terminal text-imperium-steel">Role:</span>
              <span className="font-display text-imperium-bone">{user.role}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-imperium-steel" />
              <span className="font-terminal text-imperium-steel">Member since:</span>
              <span className="font-terminal text-imperium-bone">
                {format(new Date(user.createdAt), "MMM yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
