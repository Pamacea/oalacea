// WorldIntro - World intro overlay with cinematic text reveal
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IMPERIUM } from '@/config/theme/imperium';

interface WorldIntroProps {
  world: 'dev' | 'art';
  isActive: boolean;
  onComplete?: () => void;
}

const WORLD_CONFIG = {
  dev: {
    title: 'DEV WORLD',
    subtitle: 'Forged in Code',
    description: 'Welcome to the Imperium of Development. Here, projects stand as monuments to engineering excellence.',
    color: IMPERIUM.gold.tailwind,
  },
  art: {
    title: 'ART WORLD',
    subtitle: 'Creative Sanctuary',
    description: 'Enter the realm of artistic expression. Each display holds a piece of creative vision.',
    color: IMPERIUM.crimson.light,
  },
};

export function WorldIntro({ world, isActive, onComplete }: WorldIntroProps) {
  const [showSkip, setShowSkip] = useState(false);
  const config = WORLD_CONFIG[world];

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowSkip(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSkip(false);
    }
  }, [isActive]);

  const handleSkip = () => {
    onComplete?.();
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      {/* Skip button */}
      <AnimatePresence>
        {showSkip && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="top-8 right-8 fixed z-50"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="border-imperium-gold/50 text-slate-300 hover:border-imperium-gold hover:text-imperium-gold bg-black/50"
            >
              <X className="mr-2 h-4 w-4" />
              Skip (ESC)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro content */}
      <div className="relative flex flex-col items-center gap-6 px-8 text-center max-w-2xl">
        {/* World icon/decoration */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
          className="relative"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-imperium-gold bg-black/50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-imperium-gold/30 border-dashed"
            />
            <span className="text-4xl font-bold text-imperium-gold">
              {world === 'dev' ? '{ }' : ''}
            </span>
          </div>
          {/* Pulsing rings */}
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full border border-imperium-gold"
            />
          ))}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="mb-2 text-5xl font-black tracking-tighter text-imperium-gold">
            {config.title}
          </h2>
          <p className="text-xl text-slate-400">{config.subtitle}</p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-lg text-slate-300"
        >
          {config.description}
        </motion.p>

        {/* Progress indicator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 6, ease: 'linear' }}
          className="h-0.5 w-48 origin-left bg-gradient-to-r from-imperium-gold to-imperium-crimson"
        />

        {/* Navigation hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex items-center gap-4 text-sm text-slate-500"
        >
          <span>Right-click to move</span>
          <span>SPACE for free camera</span>
          <span>E to interact</span>
        </motion.div>
      </div>

      {/* Corner decorations */}
      {[...Array(4)].map((_, i) => {
        const positions = [
          'top-8 left-8 border-l-2 border-t-2',
          'top-8 right-8 border-r-2 border-t-2',
          'bottom-8 left-8 border-l-2 border-b-2',
          'bottom-8 right-8 border-r-2 border-b-2',
        ];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`fixed h-16 w-16 border-imperium-gold/30 ${positions[i]}`}
          />
        );
      })}
    </motion.div>
  );
}
