'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { useJoystickActive } from '@/features/3d-world/hooks';

interface ControlHint {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const controls: ControlHint[] = [
  {
    key: 'Right Click',
    label: 'Move',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    key: 'WASD',
    label: 'Directional',
    icon: (
      <div className="flex gap-0.5">
        <kbd className="rounded-none bg-imperium-steel border-2 border-imperium-steel-dark px-1.5 py-0.5 text-xs text-imperium-bone font-terminal">W</kbd>
        <kbd className="rounded-none bg-imperium-steel border-2 border-imperium-steel-dark px-1.5 py-0.5 text-xs text-imperium-bone font-terminal">A</kbd>
        <kbd className="rounded-none bg-imperium-steel border-2 border-imperium-steel-dark px-1.5 py-0.5 text-xs text-imperium-bone font-terminal">S</kbd>
        <kbd className="rounded-none bg-imperium-steel border-2 border-imperium-steel-dark px-1.5 py-0.5 text-xs text-imperium-bone font-terminal">D</kbd>
      </div>
    ),
  },
  {
    key: 'Shift',
    label: 'Sprint',
    icon: (
      <kbd className="rounded-none bg-imperium-steel border-2 border-imperium-steel-dark px-2 py-0.5 text-xs text-imperium-bone font-terminal">Shift</kbd>
    ),
  },
  {
    key: 'E',
    label: 'Interact',
    icon: (
      <kbd className="rounded-none bg-imperium-crimson/30 border-2 border-imperium-crimson px-2 py-0.5 text-xs text-imperium-crimson font-terminal shadow-[0_0_10px_rgba(154,17,21,0.4)]">E</kbd>
    ),
  },
  {
    key: 'Space',
    label: 'Camera',
    icon: (
      <kbd className="rounded-none bg-imperium-steel border-2 border-imperium-steel-dark px-2 py-0.5 text-xs text-imperium-bone font-terminal">Space</kbd>
    ),
  },
  {
    key: '?',
    label: 'Help',
    icon: (
      <kbd className="rounded-none bg-imperium-steel border-2 border-imperium-steel-dark px-2 py-0.5 text-xs text-imperium-bone font-terminal">?</kbd>
    ),
  },
];

export function ControlHints() {
  const isMobile = useIsMobile();
  const isJoystickActive = useJoystickActive();

  if (isMobile && isJoystickActive) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-30 flex flex-col gap-2 rounded-none bg-imperium-black-deep/80 p-3 backdrop-blur-md border-2 border-imperium-steel-dark shadow-[4px_4px_0_rgba(58,63,66,0.4)]"
      role="complementary"
      aria-label="Control hints"
    >
      <div className="mb-1 border-b-2 border-imperium-steel-dark pb-2">
        <span className="font-display text-xs uppercase tracking-wider text-imperium-crimson">CONTROLS</span>
      </div>
      {controls.map((control) => (
        <div key={control.key} className="flex items-center gap-2">
          {control.icon}
          <span className="font-terminal text-xs text-imperium-steel">{control.label}</span>
        </div>
      ))}
    </div>
  );
}
