'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { useJoystickActive } from '@/hooks/useJoystickActive';

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
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-400 font-mono">W</kbd>
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-400 font-mono">A</kbd>
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-400 font-mono">S</kbd>
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-400 font-mono">D</kbd>
      </div>
    ),
  },
  {
    key: 'Shift',
    label: 'Sprint',
    icon: (
      <kbd className="rounded bg-white/10 px-2 py-0.5 text-xs text-amber-400 font-mono">Shift</kbd>
    ),
  },
  {
    key: 'E',
    label: 'Interact',
    icon: (
      <kbd className="rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-300 font-mono border border-red-800/50">E</kbd>
    ),
  },
  {
    key: 'Space',
    label: 'Camera',
    icon: (
      <kbd className="rounded bg-white/10 px-2 py-0.5 text-xs text-amber-400 font-mono">Space</kbd>
    ),
  },
  {
    key: '?',
    label: 'Help',
    icon: (
      <kbd className="rounded bg-white/10 px-2 py-0.5 text-xs text-amber-400 font-mono">?</kbd>
    ),
  },
];

export function ControlHints() {
  const isMobile = useIsMobile();
  const isJoystickActive = useJoystickActive();

  if (isMobile && isJoystickActive) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-30 flex flex-col gap-2 rounded-lg bg-black/70 p-3 backdrop-blur-md border border-amber-500/20"
      role="complementary"
      aria-label="Control hints"
    >
      <div className="mb-1 border-b border-white/10 pb-2">
        <span className="text-xs font-medium text-amber-400">CONTROLS</span>
      </div>
      {controls.map((control) => (
        <div key={control.key} className="flex items-center gap-2">
          {control.icon}
          <span className="text-xs text-white/60">{control.label}</span>
        </div>
      ))}
    </div>
  );
}
