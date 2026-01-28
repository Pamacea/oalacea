'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, XRButton } from '@react-three/xr';
import { Environment } from '@react-three/drei';
import { ARPreview } from '@/core/3d/ar/ARPreview';
import { useXRStore } from '@/store/xr-store';

const arStore = createXRStore();

interface ARPageProps {
  params: Promise<{ id: string }>;
}

export default function ARPage({ params }: ARPageProps) {
  const [projectId, setProjectId] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setProjectId(id));
    setIsClient(true);
  }, [params]);

  if (!isClient || !projectId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-400">Loading AR experience...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <XR store={arStore}>
        <Canvas
          camera={{ position: [0, 0, 0], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ARPreview projectId={projectId} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
          </Suspense>
        </Canvas>
      </XR>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <XRButton
          store={arStore}
          mode="immersive-ar"
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-lg"
        >
          Start AR
        </XRButton>
      </div>
      <ARControls projectId={projectId} />
    </div>
  );
}

interface ARControlsProps {
  projectId: string;
}

function ARControls({ projectId }: ARControlsProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const url = `${window.location.origin}/ar/${projectId}`;
    import('qrcode').then(({ default: QRCode }) => {
      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0a0a0a',
          light: '#ffffff',
        },
      }).then(setQrCodeUrl);
    });
  }, [projectId]);

  const handleShare = async () => {
    const url = `${window.location.origin}/ar/${projectId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'View in AR',
          text: 'Check out this project in augmented reality!',
          url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button
        onClick={handleShare}
        className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg backdrop-blur-sm"
        aria-label="Share AR experience"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {showShare && (
        <div className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg">
          Link copied!
        </div>
      )}

      <button
        onClick={() => window.location.href = `/`}
        className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg backdrop-blur-sm"
        aria-label="Back to home"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {qrCodeUrl && (
        <div className="absolute top-12 right-0 p-2 bg-white rounded-lg shadow-lg">
          <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
        </div>
      )}
    </div>
  );
}
