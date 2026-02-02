"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Lock, Unlock, Users, MessageSquare, AlertCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useContentLock } from "@/features/auth/hooks"
import { useSession } from "next-auth/react"
import { usePermissions } from "@/features/auth/hooks"
import { cn } from "@/lib/utils"

export interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorEmail: string
  authorImage?: string | null
  createdAt: Date
  mentions?: string[]
}

interface VersionChange {
  field: string
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: Date
}

export interface CollaborationStatusProps {
  entityType: string
  entityId: string
  title?: string
  onLockRequired?: () => boolean
  className?: string
}

export function CollaborationStatus({
  entityType,
  entityId,
  title,
  onLockRequired,
  className,
}: CollaborationStatusProps) {
  const { data: session } = useSession()
  const permissions = usePermissions()
  const can = permissions.can
  const isAdmin = permissions.role === "ADMIN"
  const [isPending, startTransition] = useTransition()

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [mentions, setMentions] = useState<string[]>([])
  const [versionHistory, setVersionHistory] = useState<VersionChange[]>([])

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`)
      if (response.ok) {
        const data = await response.json()
        const commentsWithAuthors = (data.comments || []).map((c: unknown) => ({
          id: (c as { id: string }).id,
          content: (c as { content: string }).content,
          authorId: (c as { authorId: string }).authorId,
          authorName: (c as { author?: { name?: string; email?: string } })?.author?.name || (c as { author?: { email?: string } })?.author?.email || "Unknown",
          authorEmail: (c as { author?: { email?: string } })?.author?.email || "",
          authorImage: (c as { author?: { image?: string | null } })?.author?.image,
          createdAt: (c as { createdAt: Date }).createdAt,
          mentions: (c as { mentions?: string[] })?.mentions || [],
        }))
        setComments(commentsWithAuthors)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }, [entityType, entityId])

  const fetchVersionHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/${entityType}/${entityId}/versions`)
      if (response.ok) {
        const data = await response.json()
        setVersionHistory(data.versions || [])
      }
    } catch (error) {
      console.error("Failed to fetch version history:", error)
    }
  }, [entityType, entityId])

  const contentLockData = useContentLock({
    entityType,
    entityId,
    pollInterval: 15000,
    onLockAcquired: () => {
      fetchComments()
    },
    onLockConflict: () => {
      // Content is locked by another user - show notification in UI
    },
  })

  const { isLockedByMe, isLockedByOthers, isLoading, acquireLock, releaseLock, refreshLock, forceReleaseLock } = contentLockData
  const isLocked = isLockedByMe || isLockedByOthers
  const lockedBy = contentLockData.lock?.user?.name || ""

  const canEdit = can("posts:write")

  useEffect(() => {
    fetchComments()
    fetchVersionHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId])

  async function handleLockToggle() {
    if (isLockedByMe) {
      await releaseLock()
    } else {
      if (onLockRequired && !onLockRequired()) {
        return
      }
      await acquireLock()
    }
  }

  async function handlePostComment() {
    if (!newComment.trim() || !session?.user) return

    startTransition(async () => {
      try {
        const response = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            entityId,
            content: newComment,
            mentions,
          }),
        })

        if (response.ok) {
          setNewComment("")
          setMentions([])
          await fetchComments()
        }
      } catch (error) {
        console.error("Failed to post comment:", error)
      }
    })
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const lockStatus = isLockedByMe
    ? { text: "Editing", variant: "default" as const, icon: Lock }
    : isLockedByOthers
    ? { text: "Locked", variant: "crimson" as const, icon: Lock }
    : { text: "Available", variant: "ghost" as const, icon: Unlock }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Collaboration</CardTitle>
            <CardDescription>{title || "Real-time collaboration status"}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={lockStatus.variant} className="gap-1.5">
              <lockStatus.icon className="h-3.5 w-3.5" />
              {lockStatus.text}
            </Badge>
            {isLockedByOthers && lockedBy && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {lockedBy.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLocked && lockedBy && (
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="text-xs">
                  {lockedBy.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {lockedBy}
                  {isLockedByMe && " (you)"}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Locked
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(isLockedByMe || isAdmin) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (isLockedByMe ? releaseLock() : forceReleaseLock(contentLockData.lock?.id || ""))}
                  disabled={isLoading}
                >
                  {isLockedByMe ? "Release" : "Force Unlock"}
                </Button>
              )}
              {isLockedByMe && (
                <Button variant="outline" size="sm" onClick={() => refreshLock()} disabled={isLoading}>
                  Refresh
                </Button>
              )}
            </div>
          </div>
        )}

        {!isLocked && canEdit && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLockToggle}
            disabled={isLoading}
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock for editing
          </Button>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  View All ({comments.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[600px]">
                <DialogHeader>
                  <DialogTitle>All Comments</DialogTitle>
                  <DialogDescription>Discussion and collaboration history</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={comment.authorImage || undefined} />
                          <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.authorName}</span>
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-[150px]">
            <div className="space-y-3 pr-4">
              {comments.slice(-3).reverse().map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={comment.authorImage || undefined} />
                    <AvatarFallback className="text-xs">{getInitials(comment.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{comment.authorName}</span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </span>
                    </div>
                    <p className="text-xs">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No comments yet</p>
              )}
            </div>
          </ScrollArea>

          {canEdit && (
            <div className="space-y-2">
              <Label htmlFor="comment">Add a comment</Label>
              <Textarea
                id="comment"
                placeholder="Type your comment... Use @ to mention users"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {mentions.length > 0 && `Mentioning: ${mentions.join(", ")}`}
                </p>
                <Button size="sm" onClick={handlePostComment} disabled={!newComment.trim() || isPending}>
                  {isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {versionHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Recent Changes
              </h4>
              <ScrollArea className="h-[100px]">
                <div className="space-y-2 pr-4">
                  {versionHistory.slice(0, 5).map((version, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium">{version.changedBy}</span> changed{" "}
                      <span className="text-slate-600 dark:text-slate-400">{version.field}</span>
                      <span className="text-slate-500 ml-2">
                        {formatDistanceToNow(new Date(version.changedAt))} ago
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export interface LockIndicatorProps {
  entityType: string
  entityId: string
  className?: string
}

export function LockIndicator({ entityType, entityId, className }: LockIndicatorProps) {
  const { isLockedByMe, isLockedByOthers } = useContentLock({
    entityType,
    entityId
  })

  const isLocked = isLockedByMe || isLockedByOthers

  if (!isLocked) return null

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-sm",
        isLockedByMe
          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
          : "bg-orange-500/10 text-orange-700 dark:text-orange-400",
        className
      )}
    >
      <Lock className="h-4 w-4" />
      <span className="text-sm font-medium">
        {isLockedByMe ? "You are editing" : "Someone is editing"}
      </span>
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">?</AvatarFallback>
      </Avatar>
    </div>
  )
}

export interface MentionAutocompleteProps {
  search: string
  onSelect: (userId: string, name: string) => void
  children?: React.ReactNode
}

export function MentionAutocomplete({ search, onSelect }: MentionAutocompleteProps) {
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string }>>([])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  useEffect(() => {
    const fetchUsersEffect = async () => {
      if (search.startsWith("@") && search.length > 1) {
        const response = await fetch(`/api/users?search=${search.slice(1)}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data.slice(0, 5))
        }
      } else {
        setUsers([])
      }
    }
    fetchUsersEffect()
  }, [search])

  if (users.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-slate-900 rounded-sm shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
      {users.map((user) => (
        <button
          key={user.id}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
          onClick={() => onSelect(user.id, user.name || user.email)}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {getInitials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{user.name || user.email}</span>
        </button>
      ))}
    </div>
  )
}
