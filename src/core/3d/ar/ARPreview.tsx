'use client';

import { useRef, useState, useEffect } from 'react';
import { useXR, useXRHitTest } from '@react-three/xr';
import { Mesh, Group, Vector3, Quaternion, Matrix4 } from 'three';
import { useXRStore } from '@/store/xr-store';
import { Text } from '@react-three/drei';

interface ARPreviewProps {
  projectId: string;
}

export function ARPreview({ projectId }: ARPreviewProps) {
  const xrState = useXR();
  const isPresenting = xrState?.session !== null;
  const [placementPosition, setPlacementPosition] = useState<Vector3 | null>(null);
  const [placed, setPlaced] = useState(false);
  const [rotation, setRotation] = useState(0);

  const modelRef = useRef<Group>(null);
  const matrixHelper = useRef(new Matrix4());

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (!isPresenting || placed || results.length === 0) return;

      getWorldMatrix(matrixHelper.current, results[0]);
      const position = new Vector3();
      position.setFromMatrixPosition(matrixHelper.current);
      setPlacementPosition(position);
    },
    'viewer'
  );

  const handleClick = () => {
    if (!placed && placementPosition) {
      setPlaced(true);
    }
  };

  const handleRotate = (delta: number) => {
    setRotation((prev) => prev + delta);
  };

  return (
    <>
      {!isPresenting && (
        <group position={[0, 0, -1]}>
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#d4af37" />
          </mesh>
          <Text position={[0, 0.4, 0]} fontSize={0.1} color="#ffffff" anchorX="center">
            Point at a surface to start AR
          </Text>
        </group>
      )}

      {isPresenting && !placed && placementPosition && (
        <>
          <mesh position={placementPosition} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.3, 32]} />
            <meshBasicMaterial color="#4ecdc4" transparent opacity={0.6} />
          </mesh>
          <mesh position={placementPosition}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial
              color="#d4af37"
              transparent
              opacity={0.8}
              emissive="#d4af37"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh
            position={placementPosition}
            onClick={handleClick}
            visible={false}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
          </mesh>
          <Text
            position={[placementPosition.x, placementPosition.y + 0.5, placementPosition.z]}
            fontSize={0.1}
            color="#ffffff"
            anchorX="center"
          >
            Tap to place
          </Text>
        </>
      )}

      {isPresenting && placed && placementPosition && (
        <group
          ref={modelRef}
          position={[placementPosition.x, placementPosition.y + 0.25, placementPosition.z]}
          rotation={[0, rotation, 0]}
        >
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.3}
              metalness={0.7}
              emissive="#d4af37"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshStandardMaterial
              color="#8b0000"
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>

          <ARControls onRotate={handleRotate} />
        </group>
      )}

      {isPresenting && placed && (
        <PhotoCapture position={placementPosition ?? [0, 0, 0]} />
      )}
    </>
  );
}

interface ARControlsProps {
  onRotate: (delta: number) => void;
}

function ARControls({ onRotate }: ARControlsProps) {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[-0.3, 0, 0]} onClick={() => onRotate(-Math.PI / 8)}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#333333" />
        <Text position={[0, 0, 0.02]} fontSize={0.03} color="#ffffff" anchorX="center" anchorY="middle">
          -
        </Text>
      </mesh>
      <mesh position={[0.3, 0, 0]} onClick={() => onRotate(Math.PI / 8)}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#333333" />
        <Text position={[0, 0, 0.02]} fontSize={0.03} color="#ffffff" anchorX="center" anchorY="middle">
          +
        </Text>
      </mesh>
    </group>
  );
}

interface PhotoCaptureProps {
  position: Vector3 | [number, number, number];
}

function PhotoCapture({ position }: PhotoCaptureProps) {
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleCapture = async () => {
    setCapturing(true);
    setFlash(true);

    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `ar-capture-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      const screenshot = {
        id: `ar-${Date.now()}`,
        dataUrl,
        timestamp: Date.now(),
        filter: 'none',
        resolution: '1080p',
      };

      useXRStore.getState().addScreenshot(screenshot);
    }

    setTimeout(() => {
      setFlash(false);
      setCapturing(false);
    }, 200);
  };

  const pos = Array.isArray(position) ? position : [position.x, position.y, position.z];

  return (
    <group position={[pos[0], pos[1] + 0.8, pos[2]]}>
      {flash && (
        <mesh>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      )}
      <mesh onClick={handleCapture}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={capturing ? '#ff0000' : '#ffffff'}
          emissive={capturing ? '#ff0000' : '#ffffff'}
          emissiveIntensity={capturing ? 0.5 : 0}
        />
      </mesh>
      <Text position={[0, 0.15, 0]} fontSize={0.05} color="#ffffff" anchorX="center">
        {capturing ? 'Capturing...' : 'Photo'}
      </Text>
    </group>
  );
}
