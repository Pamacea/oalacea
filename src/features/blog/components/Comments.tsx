'use client'

import { useState, useActionState, useRef, useEffect, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import {
  MessageSquare as MessageSquareIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
  AlertCircle as AlertCircleIcon,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { createCommentAction } from '@/actions/comments'
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
  const [lastSuccess, setLastSuccess] = useState<string | null>(null)
  const [state, formAction, isPending] = useActionState(createCommentAction, undefined)
  const [, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  // Show success toast only once per submission
  useEffect(() => {
    if (state?.success && !isPending && lastSuccess !== 'shown') {
      toast.success('Transmission initiated successfully')
      formRef.current?.reset()
      startTransition(() => {
        setReplyTo(null)
        setLastSuccess('shown')
      })
      // Clear success state after a delay
      setTimeout(() => setLastSuccess(null), 2000)
    }
  }, [state?.success, isPending, lastSuccess])

  // Show error toast
  useEffect(() => {
    if (state?.error && !isPending) {
      toast.error(state.error)
    }
  }, [state?.error, isPending])

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
    <div className="space-y-8">
      {/* Header */}
      <div className="relative border-b-2 border-imperium-crimson pb-4">
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.8)]"
          animate={{ width: ['0%', '30%', '20%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="flex items-center gap-3">
          <div className="border-2 border-imperium-crimson bg-imperium-crimson/10 p-2 relative">
            <motion.div
              className="absolute inset-0 bg-imperium-crimson/20"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <MessageSquareIcon className="h-5 w-5 text-imperium-crimson relative z-10" />
          </div>
          <div>
            <h2 className="font-display text-xl uppercase tracking-wider text-imperium-bone">
              Transmission Log
            </h2>
            <p className="font-terminal text-xs text-imperium-steel">
              {'>'} {count} transmission{count !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="border-2 border-imperium-steel-dark bg-imperium-black-deep/50 relative overflow-hidden">
        {/* Glowing top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-imperium-crimson to-transparent opacity-60" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-imperium-crimson" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-imperium-crimson" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-imperium-crimson" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-imperium-crimson" />

        <div className="p-6">
          <h3 className="font-display text-sm uppercase tracking-wider text-imperium-crimson mb-6 flex items-center gap-2">
            <span className="text-imperium-gold">{'>'}</span>
            Initialize New Transmission
          </h3>

          <form
            ref={formRef}
            id="comment-form"
            action={formAction}
            className="space-y-5"
          >
            {/* Hidden inputs for context */}
            {postId && <input type="hidden" name="postId" value={postId} />}
            {projectId && <input type="hidden" name="projectId" value={projectId} />}
            {replyTo && <input type="hidden" name="parentId" value={replyTo} />}

            {/* Honeypot field for bot protection - hidden from users but visible to bots */}
            <input
              type="text"
              name="website"
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              placeholder="Leave blank if human"
            />


            {/* Server errors */}
            {state?.errors && Object.keys(state.errors).length > 0 && (
              <div className="bg-imperium-crimson/10 border-2 border-imperium-crimson px-4 py-3">
                {Object.entries(state.errors).map(([field, errors]) => (
                  <p key={field} className="font-terminal text-xs text-imperium-crimson border-l-2 border-imperium-crimson pl-2 mb-1 last:mb-0">
                    {Array.isArray(errors) ? errors.join(', ') : errors}
                  </p>
                ))}
              </div>
            )}

            {replyTo && (
              <div className="flex items-center justify-between bg-imperium-crimson/10 border-2 border-imperium-crimson px-4 py-3 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-imperium-crimson/5"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex items-center gap-2 relative z-10">
                  <ReplyIcon className="h-4 w-4 text-imperium-crimson" />
                  <span className="font-terminal text-sm text-imperium-crimson">
                    Replying to transmission #{replyTo.slice(0, 8)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="relative z-10 font-terminal uppercase text-xs text-imperium-crimson hover:text-imperium-bone hover:bg-imperium-crimson/20 px-2 py-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="authorName" className="font-display text-sm text-imperium-steel uppercase tracking-wide">
                  Designation
                </label>
                <input
                  id="authorName"
                  name="authorName"
                  required
                  minLength={1}
                  maxLength={100}
                  className="w-full bg-imperium-black/50 border-2 border-imperium-steel-dark text-imperium-bone placeholder:text-imperium-steel-dark font-terminal px-3 py-2 focus:border-imperium-crimson focus:outline-none"
                  placeholder="Enter your name..."
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="authorEmail" className="font-display text-sm text-imperium-steel uppercase tracking-wide">
                  Frequency <span className="text-imperium-steel-dark text-xs">(optional)</span>
                </label>
                <input
                  id="authorEmail"
                  name="authorEmail"
                  type="email"
                  className="w-full bg-imperium-black/50 border-2 border-imperium-steel-dark text-imperium-bone placeholder:text-imperium-steel-dark font-terminal px-3 py-2 focus:border-imperium-crimson focus:outline-none"
                  placeholder="your@email.com"
                />
                <p className="font-terminal text-xs text-imperium-steel-dark flex items-center gap-1">
                  <span>{'>'}</span> Only for avatar manifest
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="content" className="font-display text-sm text-imperium-steel uppercase tracking-wide">
                Message Content
              </label>
              <textarea
                id="content"
                name="content"
                required
                minLength={3}
                maxLength={2000}
                className="w-full min-h-32 bg-imperium-black/50 border-2 border-imperium-steel-dark text-imperium-bone placeholder:text-imperium-steel-dark font-terminal px-3 py-2 focus:border-imperium-crimson focus:outline-none resize-none"
                placeholder="Transmit your thoughts..."
              />
            </div>

            <div className="flex flex-row items-start gap-3 py-1">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                required
                value="on"
                className="size-4 shrink-0 rounded-none border-2 border-imperium-steel-dark bg-imperium-black transition-all outline-none focus-visible:border-imperium-crimson focus-visible:shadow-[0_0_0_2px_rgba(154,17,21,0.2)] checked:border-imperium-crimson checked:bg-imperium-crimson accent-imperium-crimson mt-0.5"
              />
              <div className="space-y-1">
                <label htmlFor="consent" className="font-display text-sm text-imperium-bone cursor-pointer">
                  I comply with transmission protocols
                </label>
                <p className="font-terminal text-xs text-imperium-steel-dark">
                  {'>'} Messages subject to Imperial screening
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-imperium-crimson text-imperium-bone border-2 border-imperium-crimson-dark hover:bg-imperium-crimson-bright disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <AlertCircleIcon className="h-4 w-4 animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4" />
                  <span>INITIATE TRANSMISSION</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {initialComments.length === 0 ? (
          <div className="border-2 border-imperium-steel-dark/50 bg-imperium-black-deep/30 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>
            <MessageSquareIcon className="mx-auto mb-4 h-12 w-12 text-imperium-steel-dark opacity-40" />
            <p className="font-terminal text-imperium-steel-dark relative z-10">
              {'>'} No transmissions recorded. Initiate the first signal.
            </p>
          </div>
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
        'relative border border-imperium-steel-dark bg-imperium-black-deep/40 overflow-hidden',
        !isReply && 'border-2',
        isReply && 'ml-6 border-l-2 border-l-imperium-gold/40'
      )}
    >
      {/* Accent bar for main comments */}
      {!isReply && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-imperium-crimson shadow-[0_0_8px_rgba(154,17,21,0.6)]" />
      )}

      {/* Subtle corner glow for replies */}
      {isReply && (
        <div className="absolute top-0 right-0 w-4 h-4 bg-imperium-gold/10 blur-sm" />
      )}

      <div className="p-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="h-10 w-10 border-2 border-imperium-steel-dark bg-imperium-black relative">
              <img
                src={`https://www.gravatar.com/avatar/${comment.authorEmail}?d=mp&s=80`}
                alt={comment.authorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-imperium-crimson/20 text-imperium-crimson font-display text-sm border border-imperium-crimson/30">
                {getInitials(comment.authorName)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-sm uppercase tracking-wider text-imperium-bone">
                {comment.authorName}
              </span>
              <span className="h-1 w-1 bg-imperium-steel-dark rounded-full" />
              <span className="font-terminal text-xs text-imperium-steel-dark">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {comment.status === 'PENDING' && (
                <>
                  <span className="h-1 w-1 bg-imperium-steel-dark rounded-full" />
                  <span className="inline-flex items-center gap-1.5 border border-imperium-gold/50 bg-imperium-gold/10 px-2 py-0.5 text-xs text-imperium-gold font-terminal uppercase">
                    <AlertCircleIcon className="h-3 w-3" />
                    Awaiting moderation
                  </span>
                </>
              )}
            </div>

            {/* Message */}
            <p className="font-terminal text-sm leading-relaxed text-imperium-steel whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Actions */}
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="gap-1.5 rounded-none font-terminal uppercase text-xs text-imperium-steel-dark hover:text-imperium-crimson hover:bg-imperium-crimson/10 px-0 h-auto py-0"
              >
                <ReplyIcon className="h-3 w-3" />
                Reply to transmission
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-5 space-y-4">
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
    </div>
  )
}

export default Comments
