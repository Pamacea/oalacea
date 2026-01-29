'use client';

import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { InteractionPrompt } from './InteractionPrompt';
import { SceneOverlay } from './SceneOverlay';
import { InWorldAdminModal } from './InWorldAdminModal';
import { HelpModal } from './HelpModal';
import { TouchInteraction, MobileUI, VirtualJoystick } from './mobile';
import { useCharacterStore } from '@/store/3d-character-store';

export function FloatingUI() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentWorld] = useState<'dev' | 'art'>('dev');

  const { canInteract, interactTarget } = useCharacterStore(
    useShallow((s) => ({
      canInteract: s.canInteract,
      interactTarget: s.interactTarget,
    }))
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-amber-500 focus:text-white focus:p-4 focus:rounded-md focus:font-semibold"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('scene-container')?.focus();
        }}
      >
        Skip to main content
      </a>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {canInteract && interactTarget ? `Can interact with ${interactTarget.name}. Press E to interact.` : ''}
      </div>

      {!isMobile && <InteractionPrompt />}

      {isMobile && <TouchInteraction />}

      {isMobile && <MobileUI currentWorld={currentWorld} />}

      {isMobile && <VirtualJoystick />}

      <SceneOverlay />
      <InWorldAdminModal />
      <HelpModal />
    </>
  );
}
