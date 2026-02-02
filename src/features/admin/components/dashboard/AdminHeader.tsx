'use client';

import { GlitchText, ChaoticOverlay, ScanlineBeam } from '@/components/ui/imperium';
import { Skull } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminHeader() {
  return (
    <div className="relative mb-8 border-b-2 border-imperium-crimson bg-imperium-black-deep/30 pb-6 overflow-hidden">
      <ChaoticOverlay type="scanlines" opacity={0.15} />

      <div className="absolute top-0 left-0 right-0 h-0.5">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-imperium-crimson to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ width: '30%' }}
        />
      </div>

      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-imperium-crimson" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-imperium-crimson" />

      <div className="relative flex items-center justify-between">
        <div>
          <motion.h1
            className="font-display text-3xl uppercase tracking-widest text-imperium-crimson"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlitchText intensity="severe">[ COMMAND CENTER ]</GlitchText>
          </motion.h1>
          <p className="font-terminal text-imperium-steel text-sm mt-2 flex items-center gap-2">
            <span className="text-imperium-crimson">{">"}</span>
            <span className="text-imperium-gold">IMPERIUM</span>
            <span className="text-imperium-steel-dark">{/* // ADMINISTRATION CONSOLE */}</span>
          </p>
        </div>

        <motion.div
          className="opacity-10"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Skull className="w-12 h-12 text-imperium-crimson" />
        </motion.div>
      </div>

      <ScanlineBeam color="#9a1115" duration={4} />
    </div>
  );
}
