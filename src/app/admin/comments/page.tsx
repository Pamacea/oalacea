import { getPendingComments } from '@/actions/comments'
import { approveComment, rejectComment, markCommentAsSpam, deleteComment } from '@/actions/comments'
import { GlitchText } from '@/components/ui/imperium'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Skull, Check, X, AlertTriangle, Trash2, Eye, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_ICONS = {
  PENDING: <AlertTriangle className="h-4 w-4" />,
  APPROVED: <Check className="h-4 w-4" />,
  REJECTED: <X className="h-4 w-4" />,
  SPAM: <AlertTriangle className="h-4 w-4" />,
}

const STATUS_LABELS = {
  PENDING: '[PENDING]',
  APPROVED: '[APPROVED]',
  REJECTED: '[REJECTED]',
  SPAM: '[SPAM]',
}

const STATUS_COLORS = {
  PENDING: 'border-imperium-gold bg-imperium-gold/20 text-imperium-gold',
  APPROVED: 'border-imperium-warp bg-imperium-warp/20 text-imperium-warp',
  REJECTED: 'border-imperium-maroon bg-imperium-maroon/20 text-imperium-maroon',
  SPAM: 'border-imperium-steel bg-imperium-steel/50 text-imperium-steel-dark',
}

interface ActionButtonProps {
  action?: () => Promise<void>
  icon: React.ReactNode
  label: string
  variant: 'approve' | 'reject' | 'spam' | 'delete' | 'view'
  href?: string
}

function ActionButton({ action, icon, label, variant, href }: ActionButtonProps) {
  const baseClass = 'p-2 border-2 border-transparent transition-all'
  const variantClasses = {
    approve: 'text-imperium-steel hover:text-imperium-warp hover:border-imperium-warp/30',
    reject: 'text-imperium-steel hover:text-imperium-maroon hover:border-imperium-maroon/30',
    spam: 'text-imperium-steel hover:text-imperium-steel-dark hover:border-imperium-steel-dark/30',
    delete: 'text-imperium-steel hover:text-imperium-crimson hover:border-imperium-crimson/30',
    view: 'text-imperium-steel hover:text-imperium-gold hover:border-imperium-gold/30',
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClass} ${variantClasses[variant]}`}
        title={label}
      >
        {icon}
      </Link>
    )
  }

  return (
    <form action={async () => {
      'use server'
      if (action) await action()
      redirect('/admin/comments')
    }}>
      <button
        type="submit"
        className={`${baseClass} ${variantClasses[variant]}`}
        title={label}
      >
        {icon}
      </button>
    </form>
  )
}

async function approveAction(id: string) {
  'use server'
  await approveComment(id)
}

async function rejectAction(id: string) {
  'use server'
  await rejectComment(id)
}

async function spamAction(id: string) {
  'use server'
  await markCommentAsSpam(id)
}

async function deleteAction(id: string) {
  'use server'
  await deleteComment(id)
}

interface SearchParams {
  searchParams: Promise<{ page?: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage({ searchParams }: SearchParams) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  const result = await getPendingComments({ page, limit: 20 })

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
        <Skull className="w-full h-full text-imperium-crimson" />
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-imperium-steel-dark">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-widest text-imperium-crimson flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-imperium-crimson animate-pulse" />
            <GlitchText intensity="medium">[ COMMENTS TRANSMISSIONS ]</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel text-sm mt-2 flex items-center gap-2">
            <span className="text-imperium-gold">{'>'}</span>
            <span>{result.pagination.total} TRANSMISSION{result.pagination.total > 1 ? 'S' : ''} PENDING</span>
          </p>
        </div>
      </div>

      {result.comments.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-imperium-steel-dark bg-imperium-black-deep/30">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-imperium-steel-dark opacity-50" />
          <p className="font-terminal text-imperium-steel-dark mb-4">{'>'} NO PENDING TRANSMISSIONS</p>
          <p className="font-terminal text-xs text-imperium-steel">All channels clear. Awaiting input.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {result.comments.map((comment) => (
            <div
              key={comment.id}
              className="border-2 border-imperium-steel-dark bg-imperium-black-deep/20 overflow-hidden group hover:border-imperium-crimson/50 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-display text-sm uppercase text-imperium-bone">
                        {comment.authorName}
                      </span>
                      <span className="font-terminal text-xs text-imperium-steel-dark">
                        {comment.authorEmail || 'No email provided'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 font-terminal text-xs font-semibold border-2 ${STATUS_COLORS[comment.status]}`}
                      >
                        {STATUS_ICONS[comment.status]}
                        {STATUS_LABELS[comment.status]}
                      </span>
                    </div>
                    <p className="font-terminal text-sm text-imperium-steel break-words">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {comment.post && (
                      <ActionButton
                        href={`/blog/${comment.post.slug}`}
                        icon={<Eye className="h-4 w-4" />}
                        label="View post"
                        variant="view"
                      />
                    )}
                    <ActionButton
                      action={approveAction.bind(null, comment.id)}
                      icon={<Check className="h-4 w-4" />}
                      label="Approve"
                      variant="approve"
                    />
                    <ActionButton
                      action={rejectAction.bind(null, comment.id)}
                      icon={<X className="h-4 w-4" />}
                      label="Reject"
                      variant="reject"
                    />
                    <ActionButton
                      action={spamAction.bind(null, comment.id)}
                      icon={<AlertTriangle className="h-4 w-4" />}
                      label="Mark as spam"
                      variant="spam"
                    />
                    <ActionButton
                      action={deleteAction.bind(null, comment.id)}
                      icon={<Trash2 className="h-4 w-4" />}
                      label="Delete"
                      variant="delete"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-imperium-steel-dark">
                  <span className="font-terminal text-xs text-imperium-steel-dark">
                    IP: {comment.ipAddress || 'Unknown'}
                  </span>
                  <span className="font-terminal text-xs text-imperium-steel-dark">
                    {new Date(comment.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {comment.post && (
                    <span className="font-terminal text-xs text-imperium-gold">
                      {'>'} /{comment.post.slug}
                    </span>
                  )}
                  {comment.parent && (
                    <span className="font-terminal text-xs text-imperium-maroon">
                      Reply to: {comment.parent.authorName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              {result.pagination.page > 1 && (
                <Link
                  href={`/admin/comments?page=${result.pagination.page - 1}`}
                  className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black-deep hover:border-imperium-crimson hover:text-imperium-crimson transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  PREVIOUS
                </Link>
              )}
              <span className="font-terminal text-sm text-imperium-steel-dark">
                PAGE {result.pagination.page} / {result.pagination.totalPages}
              </span>
              {result.pagination.page < result.pagination.totalPages && (
                <Link
                  href={`/admin/comments?page=${result.pagination.page + 1}`}
                  className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black-deep hover:border-imperium-crimson hover:text-imperium-crimson transition-all"
                >
                  NEXT
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
