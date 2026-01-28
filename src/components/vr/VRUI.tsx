'use client';

import { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useXR, useXRControllerState } from '@react-three/xr';
import { Group } from 'three';
import { useXRStore } from '@/store/xr-store';

interface VRButtonProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  onClick: () => void;
}

function VRButton({
  position,
  rotation = [0, 0, 0],
  label,
  onClick,
}: VRButtonProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const handlePointerEnter = () => setHovered(true);
  const handlePointerLeave = () => setHovered(false);
  const handleClick = () => onClick();

  // Zinc gray colors for Three.js
  const primaryColor = 0x71717a;
  const hoverColor = 0xa1a1aa;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial
          color={hovered ? hoverColor : primaryColor}
          emissive={hovered ? hoverColor : primaryColor}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      <Text
        position={[0, 0, 0.03]}
        fontSize={0.04}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

interface VRPanelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  title?: string;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

function VRPanel({
  position,
  rotation = [0, 0, 0],
  title,
  width = 1.5,
  height = 1,
  children,
}: VRPanelProps) {
  const panelColor = 0x18181b;
  const borderColor = 0x3f3f46;

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={panelColor}
          transparent
          opacity={0.9}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.05, height + 0.05]} />
        <meshStandardMaterial
          color={borderColor}
          transparent
          opacity={0.3}
        />
      </mesh>
      {title && (
        <Text
          position={[0, height / 2 - 0.1, 0.01]}
          fontSize={0.08}
          color="#fafafa"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      )}
      <group position={[-width / 2 + 0.1, height / 2 - 0.2, 0.01]}>
        {children}
      </group>
    </group>
  );
}

interface VRUIProps {
  showMenu?: boolean;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
  onTeleportToggle?: () => void;
  onExitVR?: () => void;
}

export function VRUI({
  showMenu = true,
  onMenuClick,
  onSettingsClick,
  onTeleportToggle,
  onExitVR,
}: VRUIProps) {
  const xrState = useXR();
  const isPresenting = xrState?.session !== null;
  const comfortSettings = useXRStore((s) => s.comfortSettings);
  const navigationSettings = useXRStore((s) => s.navigationSettings);
  const panelRef = useRef<Group>(null);

  if (!isPresenting) {
    return null;
  }

  return (
    <>
      {showMenu && (
        <group ref={panelRef} position={[0, 1.2, -0.8]} rotation={[0, 0, 0]}>
          <VRPanel position={[0, 1.2, -0.8]} title="VR Controls" width={1.2} height={0.6}>
            <VRButton
              position={[0.2, -0.15, 0]}
              label="Menu"
              onClick={onMenuClick ?? (() => {})}
            />
            <VRButton
              position={[0.6, -0.15, 0]}
              label="Settings"
              onClick={onSettingsClick ?? (() => {})}
            />
            <VRButton
              position={[1.0, -0.15, 0]}
              label="Exit"
              onClick={onExitVR ?? (() => {})}
            />
          </VRPanel>
        </group>
      )}

      <group position={[-0.5, 0.8, -0.5]} rotation={[0, 0.3, 0]}>
        <VRPanel position={[-0.5, 0.8, -0.5]} title="Movement" width={0.8} height={0.5}>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.04}
            color="#fafafa"
            anchorX="left"
            anchorY="top"
          >
            Mode: {navigationSettings.movementType}
          </Text>
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.04}
            color="#fafafa"
            anchorX="left"
            anchorY="top"
          >
            Turn: {navigationSettings.turnType}
          </Text>
          <Text
            position={[0, -0.2, 0.01]}
            fontSize={0.04}
            color="#fafafa"
            anchorX="left"
            anchorY="top"
          >
            Teleport: {navigationSettings.teleportEnabled ? 'ON' : 'OFF'}
          </Text>
        </VRPanel>
      </group>

      <group position={[0.5, 0.8, -0.5]} rotation={[0, -0.3, 0]}>
        <VRPanel position={[0.5, 0.8, -0.5]} title="Comfort" width={0.8} height={0.5}>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.04}
            color="#fafafa"
            anchorX="left"
            anchorY="top"
          >
            Level: {comfortSettings.level}
          </Text>
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.04}
            color="#fafafa"
            anchorX="left"
            anchorY="top"
          >
            Vignette: {comfortSettings.vignetteEnabled ? 'ON' : 'OFF'}
          </Text>
          <Text
            position={[0, -0.2, 0.01]}
            fontSize={0.04}
            color="#fafafa"
            anchorX="left"
            anchorY="top"
          >
            Hands: {useXRStore((s) => s.handTrackingEnabled) ? 'ON' : 'OFF'}
          </Text>
        </VRPanel>
      </group>
    </>
  );
}

export function VRButton2D({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const xrState = useXR();
  const isPresenting = xrState?.session !== null;

  if (isPresenting) {
    return null;
  }

  return (
    <button
      {...props}
      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md transition-colors"
    >
      {children}
    </button>
  );
}
