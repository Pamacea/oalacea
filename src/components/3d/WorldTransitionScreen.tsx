// WorldTransitionScreen - Écran de transition entre mondes
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useWorldStore } from '@/store/3d-world-store';

export function WorldTransitionScreen() {
  const { isTransitioning, loadingProgress, currentWorld } = useWorldStore();

  if (!isTransitioning) return null;

  const targetWorld = currentWorld === 'dev' ? 'Underground' : 'Imperium';
  const colors = currentWorld === 'dev'
    ? { from: 'from-yellow-500', to: 'to-red-500' }
    : { from: 'from-cyan-500', to: 'to-pink-500' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      {/* Portail en animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative mb-12"
      >
        {/* Cercles extérieurs qui tournent */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-32 w-32 rounded-full border-4 border-dashed border-white/20" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-24 w-24 rounded-full border-2 border-white/30" />
        </motion.div>

        {/* Vortex central */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`h-16 w-16 rounded-full bg-gradient-to-br ${colors.from} ${colors.to}`}
        />
      </motion.div>

      {/* Texte de transition */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white">
          Entering {targetWorld}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Traversing the void between worlds...
        </p>
      </motion.div>

      {/* Barre de progression */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '300px' }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="relative mt-8"
      >
        <div className="mb-2 flex justify-between text-sm text-white/60">
          <span>Transitioning</span>
          <span>{Math.round(loadingProgress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={`h-full bg-gradient-to-r ${colors.from} ${colors.to}`}
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Particules de fond */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/40"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0,
          }}
          animate={{
            y: [null, -100 - Math.random() * 200],
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </motion.div>
  );
}
