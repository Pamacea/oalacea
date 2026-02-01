'use client';

import { CheckCircle, Skull, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlitchText } from '@/components/ui/imperium';
import { ImperiumButton } from '@/components/ui/imperium/button';
import { useUISound } from '@/hooks/use-ui-sound';
import { useEffect } from 'react';

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
  confirmLabel = 'EXECUTE',
  cancelLabel = 'ABORT',
  onConfirm,
  variant = 'default',
  isLoading = false,
  isSuccess = false,
}: ConfirmDialogProps) {
  const { playHover, playClick, playOpen } = useUISound();

  // Son à l'ouverture
  useEffect(() => {
    if (open) playOpen();
  }, [open, playOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-imperium-black-deep/90 backdrop-blur-sm"
        onClick={() => !isLoading && !isSuccess && onOpenChange(false)}
      />

      {/* Dialog */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, rotateX: 15 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotateX: -15 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="relative w-full max-w-md border-2 bg-imperium-black-raise shadow-[0_0_50px_rgba(154,17,21,0.4)] rounded-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: variant === 'danger' ? '#9a1115' : '#d4af37',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-2" style={{ borderColor: variant === 'danger' ? '#9a1115' : '#d4af37' }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-2" style={{ borderColor: variant === 'danger' ? '#9a1115' : '#d4af37' }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-2" style={{ borderColor: variant === 'danger' ? '#9a1115' : '#d4af37' }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-2" style={{ borderColor: variant === 'danger' ? '#9a1115' : '#d4af37' }} />

        {/* Top accent line */}
        <div className="h-1" style={{ background: variant === 'danger' ? '#9a1115' : '#d4af37' }}>
          <motion.div
            className="h-full bg-imperium-gold"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '30%' }}
          />
        </div>

        {/* Header */}
        <div className="relative px-6 py-6 border-b-2 border-imperium-steel-dark">
          {variant === 'danger' ? (
            <div className="flex items-center justify-center mb-4">
              <Skull className="h-12 w-12 text-imperium-crimson" />
            </div>
          ) : (
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-imperium-gold" />
            </div>
          )}
          <h3 className="font-display text-xl uppercase tracking-widest text-center text-imperium-bone">
            <GlitchText intensity="high">
              {title}
            </GlitchText>
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="font-terminal text-sm text-imperium-steel text-center leading-relaxed">
            {'>'} {description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t-2 border-imperium-steel-dark bg-imperium-black-deep/30">
          <motion.button
            onMouseEnter={playHover}
            onClick={() => {
              onOpenChange(false);
              playClick();
            }}
            disabled={isLoading || isSuccess}
            className="px-4 py-2 font-display text-sm uppercase tracking-wider text-imperium-steel border-2 border-imperium-steel-dark hover:border-imperium-steel hover:text-imperium-bone transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </motion.button>

          <motion.button
            onMouseEnter={playHover}
            onClick={onConfirm}
            disabled={isLoading || isSuccess}
            className={`px-6 py-2 font-display text-sm uppercase tracking-wider border-2 transition-all ${
              variant === 'danger'
                ? 'border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-bone'
                : 'border-imperium-gold bg-imperium-gold/20 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black'
            } disabled:opacity-50`}
          >
            {isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                DONE
              </span>
            ) : isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⚙
                </motion.span>
                PROCESSING...
              </span>
            ) : (
              confirmLabel
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
