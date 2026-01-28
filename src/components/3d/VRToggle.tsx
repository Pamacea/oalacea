'use client';

import { useState, useEffect } from 'react';
import { xrStore } from '@/core/3d/vr/VRScene';
import { useXRStore } from '@/store/xr-store';

export function VRToggle() {
  const [isClient, setIsClient] = useState(false);
  const [showVROptions, setShowVROptions] = useState(false);
  const isSupported = useXRStore((s) => s.isSupported);
  const isVRSupported = useXRStore((s) => s.isVRSupported);
  const isARSupported = useXRStore((s) => s.isARSupported);
  const handTrackingEnabled = useXRStore((s) => s.handTrackingEnabled);
  const setHandTrackingEnabled = useXRStore((s) => s.setHandTrackingEnabled);

  useEffect(() => {
    setIsClient(true);
    if (navigator.xr) {
      Promise.all([
        navigator.xr.isSessionSupported('immersive-vr'),
        navigator.xr.isSessionSupported('immersive-ar'),
      ]).then(([vrSupported, arSupported]) => {
        useXRStore.getState().setSupported(vrSupported, arSupported);
      });
    }
  }, []);

  if (!isClient || !isSupported) {
    return null;
  }

  const buttonClass = "px-4 py-2 bg-zinc-800/90 backdrop-blur-sm hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-semibold transition-colors border border-zinc-700 flex items-center gap-2";

  return (
    <div className="fixed top-32 left-4 z-40 flex flex-col gap-2">
      {isVRSupported && (
        <button
          onClick={() => xrStore.enterVR()}
          className={buttonClass}
          aria-label="Enter VR mode"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          VR
        </button>
      )}

      {isARSupported && (
        <button
          onClick={() => xrStore.enterAR()}
          className={buttonClass}
          aria-label="Enter AR mode"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          AR
        </button>
      )}

      <button
        onClick={() => setShowVROptions(!showVROptions)}
        className={buttonClass}
        aria-label="XR options"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {showVROptions && (
        <div className="ml-12 p-3 bg-zinc-900/95 backdrop-blur-sm rounded-lg border border-zinc-800 text-zinc-100 text-sm">
          <h3 className="font-semibold mb-2 text-zinc-300">XR Settings</h3>

          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={handTrackingEnabled}
              onChange={(e) => setHandTrackingEnabled(e.target.checked)}
              className="w-4 h-4 accent-zinc-400"
            />
            <span>Hand Tracking</span>
          </label>

          <div className="text-xs text-zinc-500 mt-2">
            {isVRSupported && 'VR supported'}
            {isARSupported && ' | AR supported'}
          </div>
        </div>
      )}
    </div>
  );
}
