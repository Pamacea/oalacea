// ControlsPanel - UI for camera and controls shortcuts
'use client';

import { ShareButton } from '@/components/ShareButton';

interface ControlsPanelProps {
  showShortcuts: boolean;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  cameraMode: 'follow' | 'free';
  onToggleCamera: () => void;
  cameraX?: number;
  cameraZ?: number;
}

export function ControlsPanel({
  showShortcuts,
  setShowShortcuts,
  cameraMode,
  onToggleCamera,
  cameraX = 0,
  cameraZ = 0,
}: ControlsPanelProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 items-end">
      {showShortcuts && (
        <div className="mb-2 rounded-lg bg-black/80 backdrop-blur-md p-3 text-white border border-white/10 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <h3 className="text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Controls</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Move</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Right Click</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Camera</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Space</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Sprint</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Shift</span>
            </div>
            {cameraMode === 'free' && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Free Cam</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">WASD</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowShortcuts(s => !s)}
        className={`w-10 h-10 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all ${
          showShortcuts ? 'bg-white/20 border-white/30' : 'bg-black/50 border-white/10 hover:bg-white/10'
        }`}
        title="Controls"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      <button
        onClick={onToggleCamera}
        className={`w-10 h-10 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all ${
          cameraMode === 'free'
            ? 'bg-orange-600/80 border-orange-400'
            : 'bg-black/50 border-white/10 hover:bg-white/10'
        }`}
        title={cameraMode === 'follow' ? 'Unlock camera (Space)' : 'Lock camera (Space)'}
      >
        {cameraMode === 'follow' ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a5 5 0 00-10 0v2H6v10h12V8h-2zM9 6a3 3 0 116 0v2H9V6z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9h-1V6a5 5 0 00-10 0v2H6v10h12V8zm-6-5a3 3 0 013 3v2H9V6a3 3 0 013-3zm0 14a4 4 0 110-8 4 4 0 010 8z" />
          </svg>
        )}
      </button>

      <ShareButton cameraX={cameraX} cameraZ={cameraZ} />
    </div>
  );
}
