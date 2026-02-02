'use client';

import { useSession } from 'next-auth/react';
import { AdminTerminal } from './AdminTerminal';
import { useInWorldAdminStore } from '@/features/admin/store';

interface AdminTerminalWrapperProps {
  world: 'DEV' | 'ART';
  position: [number, number, number];
}

export function AdminTerminalWrapper({ world, position }: AdminTerminalWrapperProps) {
  const { isOpen } = useInWorldAdminStore();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;

  return (
    <AdminTerminal
      position={position}
      world={world}
      isActive={isOpen}
      isAdmin={isAdmin}
    />
  );
}
