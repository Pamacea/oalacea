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
      className={`fixed top-4 right-24 z-30 h-10 w-10 rounded-none border-2 backdrop-blur-sm transition-colors flex items-center justify-center font-display text-xs uppercase ${
        isAdmin
          ? 'bg-imperium-crimson text-imperium-bone border-imperium-crimson hover:bg-imperium-crimson-bright shadow-[0_0_10px_rgba(154,17,21,0.4)]'
          : 'bg-imperium-iron text-imperium-steel border-imperium-steel-dark'
      }`}
      aria-label="Admin panel"
    >
      A
    </button>
  );
}
