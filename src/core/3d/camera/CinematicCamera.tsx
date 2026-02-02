// CinematicCamera - Automated camera movement for world intro sequences
'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Vector3, PerspectiveCamera as PerspectiveCameraType, MathUtils } from 'three';
import { useOnboardingStore } from '@/features/onboarding/store';

export interface CinematicPathPoint {
  position: [number, number, number];
  lookAt: [number, number, number];
  duration?: number;
}

export interface CinematicCameraProps {
  /** Path points for the cinematic */
  path: CinematicPathPoint[];
  /** Target world for intro */
  world: 'dev' | 'art';
  /** Total duration in seconds */
  duration?: number;
  /** When cinematic completes */
  onComplete?: () => void;
  /** Allow skip with ESC */
  allowSkip?: boolean;
  /** Camera ref to transition to */
  targetCameraRef?: React.MutableRefObject<PerspectiveCameraType | null>;
}

export function CinematicCamera({
  path,
  world,
  duration = 8,
  onComplete,
  allowSkip = true,
}: CinematicCameraProps) {
  const cameraRef = useRef<PerspectiveCameraType | null>(null);
  const startTimeRef = useRef<number>(0);
  const [isActive, setIsActive] = useState(() => {
    const { seenDevWorldIntro, seenArtWorldIntro } = useOnboardingStore.getState();
    const shouldPlay = world === 'dev' ? !seenDevWorldIntro : !seenArtWorldIntro;
    return shouldPlay;
  });
  const [isSkipped, setIsSkipped] = useState(false);

  const { seenDevWorldIntro, seenArtWorldIntro, setWorldIntroSeen } = useOnboardingStore();

  // Check if intro should play
  const shouldPlay = world === 'dev' ? !seenDevWorldIntro : !seenArtWorldIntro;

  // Initialize start time when cinematic begins
  useEffect(() => {
    if (!shouldPlay || isSkipped) {
      return;
    }

    // Initialize start time
    startTimeRef.current = Date.now();

    // Mark as seen
    setWorldIntroSeen(world);

    // Skip handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allowSkip && e.key === 'Escape') {
        setIsSkipped(true);
        setIsActive(false);
        onComplete?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-complete after duration
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration * 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [allowSkip, duration, isSkipped, onComplete, shouldPlay, world, setWorldIntroSeen]);

  // Calculate position along path using Catmull-Rom spline
  const getPointOnPath = (t: number) => {
    const normalizedT = MathUtils.clamp(t, 0, 1);
    const totalPoints = path.length;
    const segmentLength = 1 / (totalPoints - 1);
    const segmentIndex = Math.floor(normalizedT / segmentLength);
    const segmentT = (normalizedT - segmentIndex * segmentLength) / segmentLength;

    const currentPoint = path[Math.min(segmentIndex, totalPoints - 1)];
    const nextPoint = path[Math.min(segmentIndex + 1, totalPoints - 1)];

    // Linear interpolation (could use CatmullRomCurve3 for smoother curves)
    const position: [number, number, number] = [
      currentPoint.position[0] + (nextPoint.position[0] - currentPoint.position[0]) * segmentT,
      currentPoint.position[1] + (nextPoint.position[1] - currentPoint.position[1]) * segmentT,
      currentPoint.position[2] + (nextPoint.position[2] - currentPoint.position[2]) * segmentT,
    ];

    const lookAt: [number, number, number] = [
      currentPoint.lookAt[0] + (nextPoint.lookAt[0] - currentPoint.lookAt[0]) * segmentT,
      currentPoint.lookAt[1] + (nextPoint.lookAt[1] - currentPoint.lookAt[1]) * segmentT,
      currentPoint.lookAt[2] + (nextPoint.lookAt[2] - currentPoint.lookAt[2]) * segmentT,
    ];

    return { position, lookAt };
  };

  useFrame(() => {
    if (!isActive || !cameraRef.current || isSkipped) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const t = elapsed / duration;

    if (t >= 1) {
      setIsActive(false);
      return;
    }

    const { position, lookAt } = getPointOnPath(t);

    cameraRef.current.position.set(...position);
    cameraRef.current.lookAt(new Vector3(...lookAt));
  });

  if (!shouldPlay || !isActive) return null;

  const initialPosition = path[0]?.position ?? [0, 20, 30];

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        fov={50}
        makeDefault
        position={initialPosition}
      />
    </>
  );
}

// Predefined paths for each world
export const DEV_WORLD_PATH: CinematicPathPoint[] = [
  { position: [-40, 35, 40], lookAt: [0, 0, 0] },
  { position: [-25, 30, 25], lookAt: [0, 0, 0] },
  { position: [0, 25, 0], lookAt: [10, 0, 10] },
  { position: [15, 20, 15], lookAt: [0, 0, 0] },
  { position: [-15, 20, 15], lookAt: [0, 0, 0] },
];

export const ART_WORLD_PATH: CinematicPathPoint[] = [
  { position: [0, 40, 50], lookAt: [0, 0, 0] },
  { position: [30, 25, 20], lookAt: [0, 0, 0] },
  { position: [-20, 15, -10], lookAt: [0, 5, 0] },
  { position: [0, 10, 0], lookAt: [0, 0, 0] },
];
