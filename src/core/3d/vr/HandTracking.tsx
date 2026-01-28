'use client';

import { useRef, useEffect, useState } from 'react';
import { useXR, useXRInputSourceStates, XRSpace } from '@react-three/xr';
import { Group, Mesh, Vector3 } from 'three';
import { useXRStore } from '@/store/xr-store';

interface HandGesture {
  type: 'point' | 'grab' | 'release' | 'none';
  confidence: number;
}

interface HandTrackingProps {
  onGesture?: (handedness: 'left' | 'right', gesture: HandGesture) => void;
  onInteract?: (handedness: 'left' | 'right', position: Vector3) => void;
}

export function HandTracking({ onGesture, onInteract }: HandTrackingProps) {
  const enabled = useXRStore((s) => s.handTrackingEnabled);
  const hapticEnabled = useXRStore((s) => s.hapticEnabled);
  const inputSourceStates = useXRInputSourceStates();

  const leftHandInputSourceState = inputSourceStates.find(
    (state) => state.inputSource.handedness === 'left' && state.inputSource.hand
  );
  const rightHandInputSourceState = inputSourceStates.find(
    (state) => state.inputSource.handedness === 'right' && state.inputSource.hand
  );

  const [leftGesture, setLeftGesture] = useState<HandGesture>({ type: 'none', confidence: 0 });
  const [rightGesture, setRightGesture] = useState<HandGesture>({ type: 'none', confidence: 0 });

  const triggerHaptic = (inputSourceState: any, intensity: number, duration: number) => {
    if (!hapticEnabled || !inputSourceState) return;

    const gamepad = inputSourceState.inputSource.gamepad;
    if (gamepad?.hapticActuators) {
      gamepad.hapticActuators.forEach((actuator: any) => {
        actuator.pulse?.(intensity, duration);
      });
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const checkGestures = () => {
      // Simple gesture detection based on gamepad input when hand tracking is active
      const left = leftHandInputSourceState ? { type: 'none' as const, confidence: 0 } : { type: 'none' as const, confidence: 0 };
      const right = rightHandInputSourceState ? { type: 'none' as const, confidence: 0 } : { type: 'none' as const, confidence: 0 };

      // Detect grab using grip button
      if (leftHandInputSourceState?.inputSource?.gamepad?.buttons?.[1]?.pressed) {
        const grabGesture = { type: 'grab' as const, confidence: 1 };
        if (leftGesture.type !== 'grab') {
          setLeftGesture(grabGesture);
          onGesture?.('left', grabGesture);
          triggerHaptic(leftHandInputSourceState, 0.5, 20);
        }
      } else if (leftGesture.type !== 'none') {
        setLeftGesture({ type: 'none', confidence: 0 });
        onGesture?.('left', { type: 'none', confidence: 0 });
      }

      if (rightHandInputSourceState?.inputSource?.gamepad?.buttons?.[1]?.pressed) {
        const grabGesture = { type: 'grab' as const, confidence: 1 };
        if (rightGesture.type !== 'grab') {
          setRightGesture(grabGesture);
          onGesture?.('right', grabGesture);
          triggerHaptic(rightHandInputSourceState, 0.5, 20);
        }
      } else if (rightGesture.type !== 'none') {
        setRightGesture({ type: 'none', confidence: 0 });
        onGesture?.('right', { type: 'none', confidence: 0 });
      }
    };

    const interval = setInterval(checkGestures, 100);

    return () => clearInterval(interval);
  }, [enabled, leftHandInputSourceState, rightHandInputSourceState, leftGesture, rightGesture, onGesture, hapticEnabled]);

  if (!enabled) return null;

  return (
    <group>
      {/* The XRHandModel is automatically rendered by the XR system when hands are detected */}
      {/* We just need to provide gesture callbacks and interaction feedback */}
    </group>
  );
}

interface HandInteractableProps {
  position: [number, number, number];
  onGrab?: () => void;
  onPoint?: () => void;
  children?: React.ReactNode;
}

export function HandInteractable({ position, onGrab, onPoint, children }: HandInteractableProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);

  const handlePointerEnter = () => {
    setHovered(true);
  };

  const handlePointerLeave = () => {
    setHovered(false);
  };

  const handlePointerDown = () => {
    setGrabbed(true);
    onGrab?.();
  };

  const handlePointerUp = () => {
    setGrabbed(false);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {children ?? (
        <>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial
            color={grabbed ? '#ff6b6b' : hovered ? '#d4af37' : '#666666'}
            emissive={hovered ? '#d4af37' : '#000000'}
            emissiveIntensity={hovered ? 0.5 : 0}
          />
        </>
      )}
    </mesh>
  );
}

export function FallbackControllers() {
  const inputSourceStates = useXRInputSourceStates();
  const enabled = useXRStore((s) => s.handTrackingEnabled);

  if (enabled) return null;

  const controllerInputSources = inputSourceStates.filter(
    (state) => state.inputSource.gripSpace && !state.inputSource.hand
  );

  return (
    <group>
      {controllerInputSources.map((inputSourceState: any, index: number) => (
        <XRSpace key={index} space={inputSourceState.inputSource.gripSpace}>
          <mesh>
            <boxGeometry args={[0.05, 0.1, 0.15]} />
            <meshStandardMaterial
              color={index === 0 ? '#d4af37' : '#8b0000'}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </XRSpace>
      ))}
    </group>
  );
}
