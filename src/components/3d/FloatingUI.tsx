// FloatingUI - Interface flottante au-dessus de la scène 3D
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { WorldSwitch } from './WorldSwitch';

export function FloatingUI() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top bar - Logo + World Switch */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
      >
        {/* Logo */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tighter text-white">
            OALACEA
          </h1>
        </div>

        {/* World Switch */}
        <WorldSwitch />

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white hover:bg-white/10"
        >
          <motion.svg
            className="h-6 w-6"
            animate={{ rotate: menuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </motion.svg>
        </Button>
      </motion.header>
    </>
  );
}
