'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

const hints = [
  'Use Right Click to explore the world',
  'Press WASD for directional movement',
  'Hold Shift to sprint faster',
  'Press E to interact with objects',
  'Press ? anytime for help',
];

type LoadingStep = 'assets' | 'world' | 'character' | 'complete';

function getLoadingStep(progress: number): LoadingStep {
  if (progress < 30) return 'assets';
  if (progress < 60) return 'world';
  if (progress < 100) return 'character';
  return 'complete';
}

function getStepLabel(step: LoadingStep): string {
  switch (step) {
    case 'assets': return 'Loading assets';
    case 'world': return 'Building world';
    case 'character': return 'Initializing character';
    case 'complete': return 'Ready';
  }
}

export function LoadingScreen() {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);
  const [hintIndex, setHintIndex] = useState(0);
  const currentStep = getLoadingStep(progress);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 text-4xl font-bold tracking-tighter text-white"
          >
            OALACEA
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '300px' }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="relative w-full max-w-[300px]"
          >
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-amber-400">{getStepLabel(currentStep)}</span>
              <span className="text-white/60 font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <motion.div
              className="mt-1 flex gap-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {(['assets', 'world', 'character'] as const).map((step, idx) => {
                const isActive = currentStep === step;
                const isPast = progress > (idx + 1) * 33;
                return (
                  <motion.div
                    key={step}
                    className="h-0.5 flex-1 rounded-full"
                    initial={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    animate={{
                      backgroundColor: isPast ? '#d4af37' : isActive ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.p
              key={hintIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-sm text-white/40 max-w-xs text-center"
            >
              {hints[hintIndex]}
            </motion.p>
          </AnimatePresence>

          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-12 text-white/30 text-xs"
            >
              Entering the Imperium
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
