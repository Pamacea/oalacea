'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  variant = 'default',
  isLoading = false,
  isSuccess = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !isLoading && !isSuccess && onOpenChange(open)}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-100">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading || isSuccess}
            className={cancelLabel === 'Annuler' ? 'text-zinc-400 hover:text-zinc-300' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || isSuccess}
            className={
              variant === 'danger'
                ? isSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100'
            }
          >
            {isSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Supprimé
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
