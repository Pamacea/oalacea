'use client';

import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import type { InteractionType } from './registry';

interface InSceneLabelProps {
  position: [number, number, number];
  label: string;
  type: InteractionType;
  isActive: boolean;
  targetWorld?: string;
}

const typeConfig = {
  portal: { color: 'border-imperium-crimson', bg: 'bg-imperium-crimson', text: 'ENTER' },
  route: { color: 'border-imperium-gold', bg: 'bg-imperium-gold', text: 'VIEW' },
  dialogue: { color: 'border-imperium-steel', bg: 'bg-imperium-steel', text: 'TALK' },
  pickup: { color: 'border-imperium-gold', bg: 'bg-imperium-gold', text: 'GRAB' },
  admin: { color: 'border-imperium-crimson', bg: 'bg-imperium-crimson', text: 'ACCESS' },
};

export function InSceneLabel({ position, label, type, isActive, targetWorld }: InSceneLabelProps) {
  if (!isActive) return null;

  const config = typeConfig[type];
  const displayLabel = type === 'portal' && targetWorld ? `${targetWorld.toUpperCase()}` : label.toUpperCase();

  return (
    <Html
      position={[position[0], position[1] + 4.5, position[2]]}
      center
      distanceFactor={7}
      zIndexRange={[100, 0]}
      style={{ pointerEvents: 'none' as const }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="relative"
      >
        <div className={`
          flex flex-col items-center gap-3 px-10 py-5 min-w-[250px]
          bg-imperium-black/95 backdrop-blur-md
          border-2 ${config.color}
        `}>
          <span className="font-display text-imperium-bone tracking-widest uppercase font-bold whitespace-nowrap" style={{ fontSize: '64px' }}>
            {displayLabel}
          </span>
          <div className="flex items-center gap-3">
            <kbd className={`
              h-14 min-w-[56px] rounded-none px-4 font-terminal font-bold
              ${config.bg} text-imperium-black
              border-2 border-imperium-black/30
              flex items-center justify-center
            `} style={{ fontSize: '32px' }}>
              E
            </kbd>
            <span className="font-terminal text-imperium-bone uppercase whitespace-nowrap" style={{ fontSize: '32px' }}>
              {config.text}
            </span>
          </div>
        </div>

        <div className={`
          absolute -bottom-1 left-2 right-2 h-1
          ${config.bg} opacity-60
        `} />
      </motion.div>
    </Html>
  );
}
