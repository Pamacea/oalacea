'use client';

import { useSession } from 'next-auth/react';
import { useInWorldAdminStore } from '@/features/admin/store';

export function AdminButton() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;
  const { openAdmin } = useInWorldAdminStore();

  return (
    <button
      onClick={() => isAdmin && openAdmin()}
      className={`fixed top-4 right-24 z-30 h-8 w-8 rounded-full border backdrop-blur-sm transition-colors flex items-center justify-center text-sm font-bold ${
        isAdmin
          ? 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-500'
          : 'bg-zinc-800/50 text-zinc-500 border-zinc-700'
      }`}
      aria-label="Admin panel"
    >
      A
    </button>
  );
}
