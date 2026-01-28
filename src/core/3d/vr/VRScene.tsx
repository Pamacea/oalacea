'use client';

import { useEffect, useRef, useState } from 'react';
import { XR, createXRStore, XRButton, useXR } from '@react-three/xr';
import { Group } from 'three';
import { useXRStore } from '@/store/xr-store';
import { useSettingsStore } from '@/store/settings-store';
import { ThreeErrorBoundary } from '@/components/shared/error-boundary';

const xrStore = createXRStore();

interface VRSceneProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function XRSessionManager({ children }: { children: React.ReactNode }) {
  const xrState = useXR();
  const isPresenting = xrState?.session !== null;
  const setIsSupported = useXRStore((s) => s.setSupported);
  const enterVR = useXRStore((s) => s.enterVR);
  const enterAR = useXRStore((s) => s.enterAR);
  const exitXR = useXRStore((s) => s.exitXR);
  const [prevPresenting, setPrevPresenting] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      Promise.all([
        navigator.xr.isSessionSupported('immersive-vr'),
        navigator.xr.isSessionSupported('immersive-ar'),
      ]).then(([vrSupported, arSupported]) => {
        setIsSupported(vrSupported, arSupported);
      });
    }
  }, [setIsSupported]);

  useEffect(() => {
    if (isPresenting && !prevPresenting) {
      const session = xrState?.session;
      if (session?.environmentBlendMode) {
        if (session.environmentBlendMode === 'opaque') {
          enterVR();
        } else {
          enterAR();
        }
      }
    } else if (!isPresenting && prevPresenting) {
      exitXR();
    }
    setPrevPresenting(isPresenting);
  }, [isPresenting, prevPresenting, xrState, enterVR, enterAR, exitXR]);

  return <>{children}</>;
}

export function VRScene({ children, fallback }: VRSceneProps) {
  const isMobile = useSettingsStore((s) => s.isMobile);
  const qualitySettings = useSettingsStore((s) => s.qualitySettings);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback ?? null;
  }

  if (typeof navigator === 'undefined' || !navigator.xr) {
    return fallback ?? (
      <div className="flex items-center justify-center w-full h-full text-slate-400">
        <div className="text-center">
          <p className="text-lg">WebXR is not supported in this browser</p>
          <p className="text-sm mt-2">Please use Chrome, Edge, or Firefox with WebXR enabled</p>
        </div>
      </div>
    );
  }

  return (
    <ThreeErrorBoundary
      fallback={
        <div className="flex items-center justify-center w-full h-full text-slate-400">
          <div className="text-center">
            <p className="text-sm">VR scene unavailable</p>
            <p className="text-xs mt-2 text-slate-600">Please refresh the page</p>
          </div>
        </div>
      }
    >
      <XR store={xrStore}>
        <XRSessionManager>
          {children}
        </XRSessionManager>
      </XR>
    </ThreeErrorBoundary>
  );
}

export { xrStore };
