'use client';

import { useState } from 'react';
import { CheckCircle2, X, Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePendingComments, useApproveComment, useRejectComment, useDeleteComment } from '@/features/blog/queries';
import { ConfirmDialog } from './ConfirmDialog';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';
import { formatDistanceToNow } from 'date-fns';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';

export function CommentsTab() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; content: string }>({
    open: false,
    id: '',
    content: '',
  });
  const { playHover, playClick } = useUISound();

  const { data, isLoading, refetch } = usePendingComments(1, 50, true);
  const comments = data?.comments ?? [];
  const approveMutation = useApproveComment();
  const rejectMutation = useRejectComment();
  const deleteMutation = useDeleteComment();

  const filteredComments = comments.filter((comment) => {
    if (statusFilter === 'ALL') return true;
    return comment.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-imperium-gold';
      case 'APPROVED': return 'text-emerald-500';
      case 'REJECTED': return 'text-red-500';
      case 'SPAM': return 'text-purple-500';
      default: return 'text-imperium-steel';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'AWAITING';
      case 'APPROVED': return 'APPROVED';
      case 'REJECTED': return 'REJECTED';
      case 'SPAM': return 'SPAM';
      default: return status;
    }
  };

  const handleApprove = (id: string) => {
    playClick();
    approveMutation.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  const handleReject = (id: string) => {
    playClick();
    rejectMutation.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteDialog.id, {
      onSuccess: () => {
        setDeleteDialog({ open: false, id: '', content: '' });
        refetch();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 border-2 border-imperium-steel-dark bg-imperium-black/30 animate-pulse max-w-xs" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 border-2 border-imperium-steel-dark bg-imperium-black/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wider text-imperium-bone">
              <GlitchText intensity="medium">
                Comm Link
              </GlitchText>
            </h2>
            <p className="font-terminal text-xs text-imperium-steel mt-1">
              {'>'} {filteredComments.length} transmission{(filteredComments.length > 1 ? 's' : '')} in queue
            </p>
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {(['PENDING', 'APPROVED', 'REJECTED', 'SPAM', 'ALL'] as StatusFilter[]).map((filter) => (
              <motion.button
                key={filter}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={playHover}
                onClick={() => setStatusFilter(filter)}
                className={`relative px-3 py-1.5 font-terminal text-xs uppercase border-2 transition-all ${
                  statusFilter === filter
                    ? 'bg-imperium-crimson/20 border-imperium-crimson text-imperium-bone'
                    : 'border-imperium-steel-dark text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone'
                }`}
              >
                {filter === 'ALL' && 'ALL'}
                {filter !== 'ALL' && getStatusLabel(filter)}
                {filteredComments.filter((c) => c.status === filter).length > 0 && (
                  <span className="ml-1.5 px-1.5 bg-imperium-black rounded text-imperium-bone">
                    {filteredComments.filter((c) => c.status === filter).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Comments list */}
        {!filteredComments || filteredComments.length === 0 ? (
          <div className="border-2 border-dashed border-imperium-steel-dark p-12 text-center">
            <MessageSquare className="h-12 w-12 text-imperium-steel-dark mx-auto mb-4 opacity-50" />
            <p className="font-terminal text-imperium-steel text-sm mb-4">
              [{statusFilter}] NO TRANSMISSIONS FOUND
            </p>
          </div>
        ) : (
          <div className="border-2 border-imperium-steel-dark divide-y divide-imperium-steel-dark">
            {filteredComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 hover:bg-imperium-crimson/5 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Avatar with initials */}
                  <div className="h-10 w-10 border-2 border-imperium-steel-dark bg-imperium-black flex items-center justify-center shrink-0">
                    <span className="font-display text-sm text-imperium-steel">
                      {comment.authorName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-sm text-imperium-bone">
                        {comment.authorName}
                      </span>
                      <span className="h-1 w-1 bg-imperium-steel-dark rounded-full" />
                      <span className={`font-terminal text-xs ${getStatusColor(comment.status)}`}>
                        [{getStatusLabel(comment.status)}]
                      </span>
                      <span className="h-1 w-1 bg-imperium-steel-dark rounded-full" />
                      <span className="font-terminal text-xs text-imperium-steel-dark">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.post && (
                        <>
                          <span className="h-1 w-1 bg-imperium-steel-dark rounded-full" />
                          <span className="font-terminal text-xs text-imperium-steel-dark truncate max-w-[150px]">
                            on: {comment.post.title}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Message */}
                    <p className="font-terminal text-sm text-imperium-steel whitespace-pre-wrap line-clamp-3">
                      {comment.content}
                    </p>

                    {/* Email if provided */}
                    {comment.authorEmail && (
                      <p className="font-terminal text-xs text-imperium-steel-dark">
                        {'>'} contact: {comment.authorEmail}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {comment.status === 'PENDING' && (
                        <>
                          <motion.button
                            onMouseEnter={playHover}
                            onClick={() => handleApprove(comment.id)}
                            disabled={approveMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-terminal text-xs uppercase border-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {approveMutation.isPending ? 'APPROVING...' : 'APPROVE'}
                          </motion.button>
                          <motion.button
                            onMouseEnter={playHover}
                            onClick={() => handleReject(comment.id)}
                            disabled={rejectMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-terminal text-xs uppercase border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            {rejectMutation.isPending ? 'REJECTING...' : 'REJECT'}
                          </motion.button>
                        </>
                      )}
                      {comment.status === 'PENDING' && (
                        <motion.button
                          onMouseEnter={playHover}
                          onClick={() => setDeleteDialog({ open: true, id: comment.id, content: comment.content })}
                          className="p-1.5 text-imperium-steel hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      )}
                      {comment.status !== 'PENDING' && (
                        <motion.button
                          onMouseEnter={playHover}
                          onClick={() => setDeleteDialog({ open: true, id: comment.id, content: comment.content })}
                          className="p-1.5 text-imperium-steel hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="CONFIRM DELETION"
        description={`You are about to purge this transmission permanently. This action cannot be undo.\n\n"${deleteDialog.content.slice(0, 100)}${deleteDialog.content.length > 100 ? '...' : ''}"`}
        confirmLabel="PURGE"
        cancelLabel="ABORT"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
