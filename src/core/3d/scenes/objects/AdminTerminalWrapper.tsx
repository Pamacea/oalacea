'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminTerminal } from './AdminTerminal';
import { useInWorldAdminStore } from '@/store/in-world-admin-store';

interface AdminTerminalWrapperProps {
  world: 'DEV' | 'ART';
  position: [number, number, number];
}

export function AdminTerminalWrapper({ world, position }: AdminTerminalWrapperProps) {
  const { isOpen, openAdmin } = useInWorldAdminStore();
  const [isActive, setIsActive] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;

  // Close modal when moving away from terminal
  const handleInteract = () => {
    setIsActive(true);
    openAdmin();
    setTimeout(() => setIsActive(false), 1000);
  };

  return (
    <AdminTerminal
      position={position}
      world={world}
      isActive={isActive || isOpen}
      onInteract={handleInteract}
      isAdmin={isAdmin}
    />
  );
}
