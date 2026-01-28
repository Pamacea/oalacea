// FollowCamera - Caméra isométrique qui suit le personnage
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Vector3, PerspectiveCamera as PerspectiveCameraType } from 'three';
import { clampCameraPosition, CAMERA_LIMITS } from './cameraBounds';
import { useSettingsStore } from '@/store/settings-store';

export interface FollowCameraProps {
  targetRef: React.MutableRefObject<Vector3>;
  mode: 'follow' | 'free';
  cameraRef?: React.MutableRefObject<PerspectiveCameraType | null>;
  onPositionChange?: (position: { x: number; z: number }) => void;
}

const REDUCED_MOTION_SMOOTH_FACTOR = 0.02;
const DEFAULT_SMOOTH_FACTOR = 0.08;

export function FollowCamera({ targetRef, mode, cameraRef: externalCameraRef, onPositionChange }: FollowCameraProps) {
  const ref = useRef<PerspectiveCameraType | null>(null);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  const isoOffset = { x: -15, y: 20, z: 15 };
  const cameraTarget = useRef({ x: -15, y: 20, z: 15 });
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const lastReportedPosition = useRef({ x: -15, z: 15 });
  const smoothFactor = reducedMotion ? REDUCED_MOTION_SMOOTH_FACTOR : DEFAULT_SMOOTH_FACTOR;

  // Sync external ref
  useEffect(() => {
    if (externalCameraRef) {
      externalCameraRef.current = ref.current;
    }
  });

  // Report position change callback (throttled)
  const reportPosition = (x: number, z: number) => {
    if (!onPositionChange) return;
    // Only report if position changed significantly (more than 0.5 units)
    if (Math.abs(x - lastReportedPosition.current.x) > 0.5 ||
        Math.abs(z - lastReportedPosition.current.z) > 0.5) {
      lastReportedPosition.current = { x, z };
      onPositionChange({ x, z });
    }
  };

  // Setup keyboard pour mode free
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'free') return;

      switch (e.code) {
        case 'KeyW':
        case 'KeyZ':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'KeyQ':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'KeyZ':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'KeyQ':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    if (mode === 'follow') {
      const target = targetRef.current;
      const targetX = target.x + isoOffset.x;
      const targetY = isoOffset.y;
      const targetZ = target.z + isoOffset.z;

      const currentSmoothFactor = reducedMotion ? REDUCED_MOTION_SMOOTH_FACTOR : DEFAULT_SMOOTH_FACTOR;

      cameraTarget.current.x += (targetX - cameraTarget.current.x) * currentSmoothFactor;
      cameraTarget.current.y += (targetY - cameraTarget.current.y) * currentSmoothFactor;
      cameraTarget.current.z += (targetZ - cameraTarget.current.z) * currentSmoothFactor;

      ref.current.position.set(
        cameraTarget.current.x,
        cameraTarget.current.y,
        cameraTarget.current.z
      );

      ref.current.lookAt(target.x, 0, target.z);

      // Report position in follow mode too
      reportPosition(cameraTarget.current.x, cameraTarget.current.z);
    } else {
      const speed = 30;
      let dx = 0;
      let dz = 0;

      if (keys.current.forward) dz -= 1;
      if (keys.current.backward) dz += 1;
      if (keys.current.left) dx -= 1;
      if (keys.current.right) dx += 1;

      if (dx !== 0 || dz !== 0) {
        const newX = cameraTarget.current.x + dx * speed * delta;
        const newZ = cameraTarget.current.z + dz * speed * delta;

        // Check if new position would be clamped (at boundary)
        const newPos = new Vector3(newX, cameraTarget.current.y, newZ);
        const clampedPos = clampCameraPosition(newPos, targetRef.current, CAMERA_LIMITS);

        // Only move if not at boundary (position changed after clamping)
        if (Math.abs(clampedPos.x - newX) < 0.01 && Math.abs(clampedPos.z - newZ) < 0.01) {
          cameraTarget.current.x = clampedPos.x;
          cameraTarget.current.z = clampedPos.z;
        }
        // If at boundary, don't update position - camera stays still
      }

      ref.current.position.set(
        cameraTarget.current.x,
        cameraTarget.current.y,
        cameraTarget.current.z
      );

      // Fixed isometric view - look at a point below based on isoOffset
      ref.current.lookAt(
        cameraTarget.current.x - isoOffset.x,
        0,
        cameraTarget.current.z - isoOffset.z
      );

      // Report position in free mode
      reportPosition(cameraTarget.current.x, cameraTarget.current.z);
    }
  });

  return (
    <PerspectiveCamera
      ref={ref}
      fov={40}
      makeDefault
      position={[-15, 20, 15]}
    />
  );
}
