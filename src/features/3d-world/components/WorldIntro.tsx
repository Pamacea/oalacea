// WorldIntro - World intro overlay with cinematic text reveal
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    color: 'text-imperium-gold',
    border: 'border-imperium-gold',
  },
  art: {
    title: 'ART WORLD',
    subtitle: 'Creative Sanctuary',
    description: 'Enter the realm of artistic expression. Each display holds a piece of creative vision.',
    color: 'text-imperium-crimson',
    border: 'border-imperium-crimson',
  },
};

export function WorldIntro({ world, isActive, onComplete }: WorldIntroProps) {
  const [showSkip, setShowSkip] = useState(false);
  const config = WORLD_CONFIG[world];

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    return () => clearTimeout(timer);
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
      className="fixed inset-0 z-40 flex items-center justify-center bg-imperium-black-deep/90 backdrop-blur-sm"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(74,79,82,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(74,79,82,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

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
              className="rounded-none border-2 border-imperium-steel-dark bg-imperium-black text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson font-terminal uppercase text-xs"
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
          <div className={`flex h-24 w-24 items-center justify-center rounded-none border-2 ${config.border} bg-imperium-black shadow-[4px_4px_0_rgba(0,0,0,0.5)]`}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className={`absolute inset-0 rounded-none border ${config.border} border-dashed`}
            />
            <span className={`font-display text-4xl font-bold ${config.color}`}>
              {world === 'dev' ? '{ }' : '◆'}
            </span>
          </div>
          {/* Pulsing rings - brutal squares */}
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
              className={`absolute inset-0 rounded-none border ${config.border}`}
            />
          ))}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className={`mb-2 font-display text-5xl uppercase tracking-[0.2em] ${config.color} border-b-2 ${config.border} pb-2`}>
            {config.title}
          </h2>
          <p className="font-terminal text-xl text-imperium-steel">{config.subtitle}</p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="font-terminal text-lg text-imperium-bone max-w-md"
        >
          {config.description}
        </motion.p>

        {/* Progress indicator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 6, ease: 'linear' }}
          className="h-1 w-48 origin-left bg-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.6)]"
        />

        {/* Navigation hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex items-center gap-4 font-terminal text-sm text-imperium-steel-dark"
        >
          <span className="border-l-2 border-imperium-steel-dark pl-2">Right-click to move</span>
          <span className="border-l-2 border-imperium-steel-dark pl-2">SPACE for free camera</span>
          <span className="border-l-2 border-imperium-steel-dark pl-2">E to interact</span>
        </motion.div>
      </div>

      {/* Corner decorations - brutal corners */}
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
            className={`fixed h-16 w-16 ${config.border} ${positions[i]}`}
          />
        );
      })}
    </motion.div>
  );
}
