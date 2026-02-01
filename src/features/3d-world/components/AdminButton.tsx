'use client';

import { useSession } from 'next-auth/react';
import { useInWorldAdminStore } from '@/features/admin/store';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function AdminButton() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;
  const { openAdmin } = useInWorldAdminStore();

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => isAdmin && openAdmin()}
      className={`flex w-16 h-14 flex-col items-center gap-1 px-3 py-2 transition-all cursor-pointer ${
        isAdmin
          ? 'bg-imperium-crimson/20 text-imperium-crimson'
          : 'text-imperium-steel hover:text-imperium-gold'
      }`}
      role="button"
      tabIndex={0}
      aria-label="Admin panel"
      onKeyDown={(e) => {
        if (isAdmin && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openAdmin();
        }
      }}
    >
      {/* Active indicator */}
      {isAdmin && (
        <motion.div
          layoutId="adminIndicator"
          className="absolute inset-0 border-2 border-imperium-crimson"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <Shield className="h-5 w-5 relative z-10" />
      <span className="font-terminal text-[10px] uppercase tracking-wider relative z-10">
        ADMIN
      </span>

      {/* Hover glow */}
      <div className="absolute inset-0 bg-imperium-gold/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
