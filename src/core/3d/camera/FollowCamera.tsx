// FollowCamera - Caméra isométrique qui suit le personnage
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Vector3, PerspectiveCamera as PerspectiveCameraType } from 'three';

export interface FollowCameraProps {
  targetRef: React.MutableRefObject<Vector3>;
  mode: 'follow' | 'free';
}

export function FollowCamera({ targetRef, mode }: FollowCameraProps) {
  const ref = useRef<PerspectiveCameraType | null>(null);

  const isoOffset = { x: -15, y: 20, z: 15 };
  const cameraTarget = useRef({ x: -15, y: 20, z: 15 });
  const keys = useRef({ forward: false, backward: false, left: false, right: false });

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

      cameraTarget.current.x += (targetX - cameraTarget.current.x) * 0.08;
      cameraTarget.current.y += (targetY - cameraTarget.current.y) * 0.08;
      cameraTarget.current.z += (targetZ - cameraTarget.current.z) * 0.08;

      ref.current.position.set(
        cameraTarget.current.x,
        cameraTarget.current.y,
        cameraTarget.current.z
      );

      ref.current.lookAt(target.x, 0, target.z);
    } else {
      const speed = 30;
      let dx = 0;
      let dz = 0;

      if (keys.current.forward) dz -= 1;
      if (keys.current.backward) dz += 1;
      if (keys.current.left) dx -= 1;
      if (keys.current.right) dx += 1;

      if (dx !== 0 || dz !== 0) {
        cameraTarget.current.x += dx * speed * delta;
        cameraTarget.current.z += dz * speed * delta;
      }

      ref.current.position.set(
        cameraTarget.current.x,
        cameraTarget.current.y,
        cameraTarget.current.z
      );

      ref.current.lookAt(cameraTarget.current.x - isoOffset.x, 0, cameraTarget.current.z - isoOffset.z);
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
