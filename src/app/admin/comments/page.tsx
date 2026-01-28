import { Suspense } from 'react';
import { getPendingComments } from '@/actions/comments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircleIcon, CheckCircleIcon, XCircleIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { approveComment, rejectComment, markCommentAsSpam, deleteComment } from '@/actions/comments';
import { revalidatePath } from 'next/cache';
import { formatDistanceToNow } from 'date-fns';

async function CommentsList() {
  const { comments } = await getPendingComments();

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircleIcon className="mb-4 size-12 text-imperium-terminal" />
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-center text-muted-foreground">
            No comments pending moderation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{comment.authorName}</CardTitle>
                {comment.authorEmail && (
                  <p className="text-sm text-muted-foreground">{comment.authorEmail}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex gap-2">
                {comment.post && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-500">
                    Blog Post
                  </span>
                )}
                {comment.project && (
                  <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-500">
                    Project
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm leading-relaxed">{comment.content}</p>

            {comment.parentId && comment.parent && (
              <div className="mb-4 rounded-md bg-muted/50 p-3 text-sm">
                <span className="font-semibold text-muted-foreground">
                  Replying to {comment.parent.authorName}:
                </span>
                <p className="mt-1 line-clamp-2 text-muted-foreground">
                  {comment.parent.content}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <form action={async () => {
                'use server';
                await approveComment(comment.id);
                revalidatePath('/admin/comments');
              }}>
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className="gap-1 bg-imperium-terminal hover:bg-imperium-terminal/90"
                >
                  <CheckCircleIcon className="size-4" />
                  Approve
                </Button>
              </form>

              <form action={async () => {
                'use server';
                await rejectComment(comment.id);
                revalidatePath('/admin/comments');
              }}>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="gap-1"
                >
                  <XCircleIcon className="size-4" />
                  Reject
                </Button>
              </form>

              <form action={async () => {
                'use server';
                await markCommentAsSpam(comment.id);
                revalidatePath('/admin/comments');
              }}>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="gap-1 border-zinc-500/50 text-zinc-400 hover:bg-zinc-500/10"
                >
                  <AlertCircleIcon className="size-4" />
                  Spam
                </Button>
              </form>

              <form action={async () => {
                'use server';
                await deleteComment(comment.id);
                revalidatePath('/admin/comments');
              }}>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="gap-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <TrashIcon className="size-4" />
                  Delete
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CommentsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comment Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate comments submitted by users
        </p>
      </div>

      <Suspense fallback={<CommentsListSkeleton />}>
        <CommentsList />
      </Suspense>
    </div>
  );
}
