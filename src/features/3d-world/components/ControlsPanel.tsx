'use client';

import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

interface ControlsPanelProps {
  cameraMode: 'follow' | 'free';
  onToggleCamera: () => void;
}

export function ControlsPanel({
  cameraMode,
  onToggleCamera,
}: ControlsPanelProps) {
  const isActive = cameraMode === 'free';

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggleCamera}
      className={`flex w-16 h-14 flex-col items-center gap-1 px-3 py-2 transition-all cursor-pointer ${
        isActive
          ? 'bg-imperium-crimson/20 text-imperium-crimson'
          : 'text-imperium-steel hover:text-imperium-gold'
      }`}
      role="button"
      tabIndex={0}
      aria-label={cameraMode === 'follow' ? 'Unlock camera (Space)' : 'Lock camera (Space)'}
      title={cameraMode === 'follow' ? 'Unlock camera (Space)' : 'Lock camera (Space)'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleCamera();
        }
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="cameraIndicator"
          className="absolute inset-0 border-2 border-imperium-crimson"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {cameraMode === 'follow' ? (
        <Lock className="h-5 w-5 relative z-10" />
      ) : (
        <Unlock className="h-5 w-5 relative z-10" />
      )}
      <span className="font-terminal text-[10px] uppercase tracking-wider relative z-10">
        {cameraMode === 'follow' ? 'LOCK' : 'FREE'}
      </span>

      {/* Hover glow */}
      <div className="absolute inset-0 bg-imperium-gold/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
