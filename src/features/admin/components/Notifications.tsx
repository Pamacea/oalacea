'use client';

import { useEffect, useState } from "react"
import { Bell, BellRing, Check, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  entityType?: string
  entityId?: string
  link?: string
  read: boolean
  readAt?: Date
  createdAt: Date
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=20")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    loadNotifications()

    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [refreshKey])

  async function markAsRead(id?: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: id ? [id] : notifications.map((n) => n.id), read: true }),
      })

      if (response.ok) {
        setRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })

      if (response.ok) {
        setRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  async function deleteNotification(id: string) {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        setRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "COMMENT_MENTION":
        return "💬"
      case "LOCK_RELEASED":
        return "🔓"
      case "VERSION_PUBLISHED":
        return "📝"
      case "POST_PUBLISHED":
        return "✨"
      default:
        return "🔔"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-none border-2 border-transparent hover:border-imperium-steel">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-imperium-crimson" />
          ) : (
            <Bell className="h-5 w-5 text-imperium-steel" />
          )}
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-none border-2 border-imperium-crimson bg-imperium-crimson text-imperium-bone"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-none border-2 border-imperium-steel-dark">
        <DropdownMenuLabel className="flex items-center justify-between font-display uppercase tracking-wider text-imperium-crimson">
          <span>[ Notifications ]</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-terminal uppercase text-xs text-imperium-steel hover:text-imperium-crimson"
              onClick={(e) => {
                e.stopPropagation()
                markAllAsRead()
              }}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center font-terminal text-sm text-imperium-steel-dark">
              {'>'} No notifications yet
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start p-3 gap-1 rounded-none font-terminal",
                    !notification.read && "bg-imperium-crimson/10"
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                    if (notification.link) {
                      window.location.href = notification.link
                    }
                  }}
                >
                  <div className="flex items-start gap-2 w-full">
                    <span className="text-base">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs uppercase tracking-wider text-imperium-bone">{notification.title}</p>
                      <p className="font-terminal text-xs text-imperium-steel line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="font-terminal text-xs text-imperium-steel-dark mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-none"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          <Check className="h-3 w-3 text-imperium-steel" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-none hover:text-imperium-crimson"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      {notification.link && (
                        <ExternalLink className="h-3 w-3 text-imperium-steel-dark" />
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
