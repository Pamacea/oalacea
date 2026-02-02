'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare as MessageSquareIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { createComment } from '@/actions/comments'
import { commentSchema, type CommentInput } from '@/lib/validations'
import { cn } from '@/shared/utils'
import type { Comment } from '@/generated/prisma/client'

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]
}

interface CommentsProps {
  postId?: string
  projectId?: string
  initialComments?: CommentWithReplies[]
  count?: number
}

export function Comments({
  postId,
  projectId,
  initialComments = [],
  count = 0,
}: CommentsProps) {
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      authorName: '',
      authorEmail: '',
      content: '',
      postId,
      projectId,
      consent: false,
    },
  })

  const onSubmit = async (data: CommentInput) => {
    startTransition(async () => {
      const result = await createComment({
        ...data,
        postId,
        projectId,
        parentId: replyTo || undefined,
      })

      if (result.success) {
        toast.success('Comment submitted for moderation')
        form.reset()
        setReplyTo(null)
      } else {
        if (result.error) {
          toast.error(result.error)
        } else if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            form.setError(field as keyof CommentInput, {
              type: 'manual',
              message: errors?.[0],
            })
          })
        }
      }
    })
  }

  const handleReply = (commentId: string) => {
    setReplyTo(commentId)
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b-2 border-imperium-steel-dark pb-4">
        <MessageSquareIcon className="size-5 text-imperium-gold" />
        <h2 className="font-display text-xl uppercase tracking-wider text-imperium-bone">
          Comments {count > 0 && `(${count})`}
        </h2>
      </div>

      <Card variant="steel">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-imperium-crimson">
            [ Leave a Comment ]
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="comment-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {replyTo && (
                <div className="flex items-center justify-between rounded-none bg-imperium-crimson/10 border-2 border-imperium-crimson px-3 py-2 font-terminal text-sm text-imperium-crimson">
                  <span>{'> Replying to comment'}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-none font-terminal uppercase text-xs"
                    onClick={() => setReplyTo(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-imperium-bone">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-imperium-bone">Email (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-terminal text-imperium-steel-dark">
                        {'>'} Only used for Gravatar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-display text-imperium-bone">Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-display text-imperium-bone">
                        I agree to the comment policy
                      </FormLabel>
                      <FormDescription className="font-terminal text-imperium-steel-dark">
                        {'>'} Comments are moderated and may be edited for clarity.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
                variant="primary"
              >
                {isPending ? (
                  <>
                    <AlertCircleIcon className="mr-2 size-4 animate-spin text-imperium-bone" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendIcon className="mr-2 size-4 text-imperium-bone" />
                    Submit Comment
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {initialComments.length === 0 ? (
          <Card variant="iron">
            <CardContent className="py-8 text-center">
              <MessageSquareIcon className="mx-auto mb-2 size-8 text-imperium-steel-dark opacity-50" />
              <p className="font-terminal text-imperium-steel-dark">
                {'>'} No comments yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          initialComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              getInitials={getInitials}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: CommentWithReplies
  onReply: (id: string) => void
  getInitials: (name: string) => string
  depth?: number
}

function CommentItem({
  comment,
  onReply,
  getInitials,
  depth = 0,
}: CommentItemProps) {
  const isReply = depth > 0
  const maxDepth = 3

  return (
    <div
      className={cn(
        'rounded-none border-2 border-imperium-steel-dark bg-imperium-black p-4',
        isReply && 'ml-4 border-l-2 border-l-imperium-gold/30'
      )}
    >
      <div className="flex gap-3">
        <Avatar size="sm" className="border-2 border-imperium-steel-dark">
          <AvatarImage src={`https://www.gravatar.com/avatar/${comment.authorEmail}?d=mp&s=40`} />
          <AvatarFallback className="font-display bg-imperium-crimson text-imperium-bone">
            {getInitials(comment.authorName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm uppercase tracking-wider text-imperium-bone">
              {comment.authorName}
            </span>
            <span className="font-terminal text-xs text-imperium-steel-dark">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <p className="font-terminal text-sm leading-relaxed text-imperium-steel">
            {comment.content}
          </p>

          {comment.status === 'PENDING' && (
            <span className="inline-flex items-center gap-1 rounded-none border-2 border-imperium-gold bg-imperium-gold/10 px-2 py-0.5 text-xs text-imperium-gold">
              <AlertCircleIcon className="size-3" />
              Awaiting moderation
            </span>
          )}

          {depth < maxDepth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="gap-1 rounded-none font-terminal uppercase text-xs"
            >
              <ReplyIcon className="size-3" />
              Reply
            </Button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              getInitials={getInitials}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments
