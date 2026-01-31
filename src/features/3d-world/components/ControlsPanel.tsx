'use client';

interface ControlsPanelProps {
  cameraMode: 'follow' | 'free';
  onToggleCamera: () => void;
}

export function ControlsPanel({
  cameraMode,
  onToggleCamera,
}: ControlsPanelProps) {
  return (
    <button
      onClick={onToggleCamera}
      className="fixed top-4 right-14 z-30 h-10 w-10 rounded-none bg-imperium-iron text-imperium-bone border-2 border-imperium-steel-dark hover:bg-imperium-steel hover:border-imperium-crimson backdrop-blur-sm transition-colors flex items-center justify-center font-display text-xs"
      aria-label={cameraMode === 'follow' ? 'Unlock camera (Space)' : 'Lock camera (Space)'}
      title={cameraMode === 'follow' ? 'Unlock camera (Space)' : 'Lock camera (Space)'}
    >
      {cameraMode === 'follow' ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a5 5 0 00-10 0v2H6v10h12V8h-2zM9 6a3 3 0 116 0v2H9V6z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9h-1V6a5 5 0 00-10 0v2H6v10h12V8h-2zM9 6a3 3 0 013 3v2H9V6a3 3 0 013-3zm0 14a4 4 0 110-8 4 4 0 010 8z" />
        </svg>
      )}
    </button>
  );
}
