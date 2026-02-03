'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/features/3d-world/store/3d-audio-store';

/**
 * Hook to add door open/close SFX to dialogs
 * Usage: Add to any dialog component or use with DialogSfx wrapper
 */
export function useDialogSound(isOpen: boolean) {
  const { playDoorOpen, playDoorClose, isEnabled } = useAudioStore();
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (!isEnabled) return;

    const wasOpen = wasOpenRef.current;

    if (isOpen && !wasOpen) {
      playDoorOpen();
    } else if (!isOpen && wasOpen) {
      playDoorClose();
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, playDoorOpen, playDoorClose, isEnabled]);
}

/**
 * Wrapper component to add SFX to dialogs
 * Usage: Wrap DialogContent with this component
 */
export function DialogWithSfx({
  children,
  isOpen,
}: React.PropsWithChildren<{ isOpen: boolean }>) {
  useDialogSound(isOpen);
  return children as React.ReactElement;
}

/**
 * Hook to trigger notification SFX for add/edit actions
 */
export function useNotificationSfx() {
  const { playNotification, playNotificationDelete, isEnabled } = useAudioStore();

  return {
    playSuccess: () => isEnabled && playNotification(),
    playDelete: () => isEnabled && playNotificationDelete(),
    canPlay: isEnabled,
  };
}
