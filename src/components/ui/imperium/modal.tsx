/**
 * IMPERIUM MODAL - Modal brutaliste Warhammer 40K
 * AVEC EFFETS : Glitch, Noise, Scanlines, Sons
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlitchText } from './effects';
import { ChaoticOverlay, ScanlineBeam } from '../brutal/effects';
import { useUISound } from '@/hooks/use-ui-sound';

export interface ImperiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showOverlay?: boolean;
  glitchTitle?: boolean;
  soundEffects?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-[90vw] max-w-md h-auto max-h-[85vh]',
  md: 'w-[90vw] max-w-2xl h-[80vh]',
  lg: 'w-[85vw] max-w-4xl h-[85vh]',
  xl: 'w-[90vw] max-w-6xl h-[90vh]',
  full: 'w-[95vw] h-[95vh]',
};

export function ImperiumModal({
  open,
  onOpenChange,
  children,
  title,
  subtitle,
  size = 'lg',
  showOverlay = true,
  glitchTitle = true,
  soundEffects = true,
  className,
}: ImperiumModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { playOpen, playClose, playClick } = useUISound();
  const [isGlitching, setIsGlitching] = React.useState(false);

  // Son à l'ouverture
  React.useEffect(() => {
    if (open && soundEffects) {
      playOpen();
      // Glitch effect à l'ouverture
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);
    }
  }, [open, playOpen, soundEffects]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (soundEffects) playClose();
      onOpenChange(false);
    }
  };

  // Close on Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        if (soundEffects) playClose();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange, playClose, soundEffects]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {/* Backdrop with overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Chaotic overlay - brutaliste visible */}
        {showOverlay && (
          <>
            <div className="absolute inset-0 bg-imperium-black-deep/90 backdrop-blur-sm" />
            <ChaoticOverlay type="all" opacity={0.4} />
            <ScanlineBeam color="#9a1115" duration={3} />
          </>
        )}

        {/* Modal Container */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.9, opacity: 0, rotateX: -10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'relative z-[51]',
            sizeMap[size],
            'border-2 border-imperium-crimson',
            'bg-imperium-black-raise',
            'shadow-[0_0_60px_rgba(154,17,21,0.4),_8px_8px_0_rgba(154,17,21,0.3)]',
            'rounded-none overflow-hidden flex flex-col',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glitch overlay at opening */}
          <AnimatePresence>
            {isGlitching && (
              <>
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-imperium-crimson/20 z-50 pointer-events-none"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(154,17,21,0.3) 2px, rgba(154,17,21,0.3) 4px)',
                  }}
                />
                <motion.div
                  initial={{ x: -10, opacity: 0.5 }}
                  animate={{ x: 0, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-imperium-crimson/10 mix-blend-screen z-50 pointer-events-none"
                />
              </>
            )}
          </AnimatePresence>

          {/* Top accent line with pulse */}
          <div className="absolute left-0 top-0 right-0 h-1 z-20">
            <motion.div
              className="h-full bg-imperium-crimson"
              animate={{
                boxShadow: ['0 0 10px rgba(154,17,21,0.5)', '0 0 30px rgba(154,17,21,0.8)', '0 0 10px rgba(154,17,21,0.5)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-imperium-crimson z-20" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-imperium-crimson z-20" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-imperium-crimson z-20" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-imperium-crimson z-20" />

          {/* Header */}
          {(title || subtitle) && (
            <div className="relative border-b-2 border-imperium-steel-dark bg-imperium-black-deep/50 px-6 py-4 shrink-0">
              {/* Scanlines in header */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(154,17,21,0.1)_1px,rgba(154,17,21,0.1)_2px)]" />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  {title && (
                    <h2 className="font-display text-xl uppercase tracking-widest text-imperium-bone">
                      {glitchTitle ? (
                        <GlitchText intensity="severe" auto>
                          {title}
                        </GlitchText>
                      ) : (
                        title
                      )}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="font-terminal text-sm text-imperium-steel mt-1">
                      {'>'} {subtitle}
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={() => {
                    if (soundEffects) playClick();
                    onOpenChange(false);
                  }}
                  className="group relative p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
                  aria-label="Close"
                >
                  <motion.div
                    className="absolute inset-0 bg-imperium-crimson/10 rounded-sm"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  />
                  <X className="h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="relative flex-1 overflow-auto">
            {/* Subtle noise overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10 h-full">{children}</div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute left-0 bottom-0 right-0 h-0.5 z-20">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-imperium-crimson to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ width: '30%' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * ImperiumModalContent - Wrapper pour le contenu de la modal
 */
export function ImperiumModalContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 h-full overflow-auto', className)}>
      {children}
    </div>
  );
}

/**
 * ImperiumModalFooter - Footer de la modal
 */
export function ImperiumModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 px-6 py-4 shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ImperiumModalSection - Section dans le contenu
 */
export function ImperiumModalSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 last:mb-0', className)}>
      {title && (
        <h3 className="font-display text-sm uppercase tracking-wider text-imperium-crimson mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-imperium-crimson" />
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export default ImperiumModal;
