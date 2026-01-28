'use client';

interface ControlsPanelProps {
  showShortcuts: boolean;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  cameraMode: 'follow' | 'free';
  onToggleCamera: () => void;
}

export function ControlsPanel({
  showShortcuts,
  setShowShortcuts,
  cameraMode,
  onToggleCamera,
}: ControlsPanelProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 items-end">
      {showShortcuts && (
        <div className="mb-2 rounded-xl bg-zinc-900/90 backdrop-blur-xl p-4 text-zinc-100 border border-zinc-800 shadow-lg">
          <h3 className="text-xs font-bold mb-3 text-zinc-400 uppercase tracking-widest">Controls</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400">Move</span>
              <span className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-xs text-zinc-300 font-semibold">Right Click</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400">Camera</span>
              <span className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-xs text-zinc-300 font-semibold">Space</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400">Sprint</span>
              <span className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-xs text-zinc-300 font-semibold">Shift</span>
            </div>
            {cameraMode === 'free' && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Free Cam</span>
                <span className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-xs text-zinc-300 font-semibold">WASD</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowShortcuts(s => !s)}
        className={`w-12 h-12 rounded-xl backdrop-blur-xl border flex items-center justify-center transition-all duration-200 shadow-lg ${
          showShortcuts
            ? 'bg-zinc-800 border-zinc-700'
            : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-800'
        }`}
        title="Controls"
      >
        <svg className="w-5 h-5 text-zinc-100" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      <button
        onClick={onToggleCamera}
        className={`w-12 h-12 rounded-xl backdrop-blur-xl border flex items-center justify-center transition-all duration-200 shadow-lg ${
          cameraMode === 'free'
            ? 'bg-zinc-700 border-zinc-600'
            : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-800'
        }`}
        title={cameraMode === 'follow' ? 'Unlock camera (Space)' : 'Lock camera (Space)'}
      >
        {cameraMode === 'follow' ? (
          <svg className="w-5 h-5 text-zinc-100" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a5 5 0 00-10 0v2H6v10h12V8h-2zM9 6a3 3 0 116 0v2H9V6z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-zinc-100" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9h-1V6a5 5 0 00-10 0v2H6v10h12V8h-2zM9 6a3 3 0 013 3v2H9V6a3 3 0 013-3zm0 14a4 4 0 110-8 4 4 0 010 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
