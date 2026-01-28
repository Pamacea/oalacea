'use client';

import { useRef, useEffect, useState } from 'react';
import { useXR, useXRHitTest, useXRInputSourceStates } from '@react-three/xr';
import { useThree } from '@react-three/fiber';
import { Mesh, Group, Vector3, Raycaster, Camera, Matrix4 } from 'three';
import { useXRStore } from '@/store/xr-store';

interface TeleportMarkerProps {
  position: [number, number, number];
  visible: boolean;
  valid: boolean;
}

function TeleportMarker({ position, visible, valid }: TeleportMarkerProps) {
  const markerRef = useRef<Mesh>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.visible = visible;
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <mesh ref={markerRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.5, 32]} />
      <meshBasicMaterial
        color={valid ? '#4ecdc4' : '#8b0000'}
        transparent
        opacity={0.6}
      />
      <pointLight color={valid ? '#4ecdc4' : '#8b0000'} intensity={2} distance={3} />
    </mesh>
  );
}

interface TeleportBeamProps {
  inputSourceState: any;
  active: boolean;
  valid: boolean;
}

function TeleportBeam({ inputSourceState, active, valid }: TeleportBeamProps) {
  const beamRef = useRef<Mesh>(null);

  useEffect(() => {
    if (beamRef.current && inputSourceState?.inputSource?.gripSpace) {
      const position = new Vector3();
      const quaternion = inputSourceState.inputSource.gripSpace.quaternion;
      inputSourceState.inputSource.gripSpace.getWorldPosition(position);

      if (beamRef.current) {
        beamRef.current.position.copy(position);
        beamRef.current.quaternion.copy(quaternion);
      }
    }
  }, [inputSourceState, active]);

  if (!active) return null;

  return (
    <mesh ref={beamRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 10, 8]} />
      <meshBasicMaterial
        color={valid ? '#4ecdc4' : '#8b0000'}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

export function VRNavigation() {
  const inputSourceStates = useXRInputSourceStates();
  const leftInputSourceState = inputSourceStates.find(
    (state) => state.inputSource.handedness === 'left'
  );
  const rightInputSourceState = inputSourceStates.find(
    (state) => state.inputSource.handedness === 'right'
  );
  const navigationSettings = useXRStore((s) => s.navigationSettings);
  const comfortSettings = useXRStore((s) => s.comfortSettings);
  const hapticEnabled = useXRStore((s) => s.hapticEnabled);

  const [teleportActive, setTeleportActive] = useState(false);
  const [teleportPosition, setTeleportPosition] = useState<[number, number, number] | null>(null);
  const [teleportValid, setTeleportValid] = useState(true);
  const [turnAngle, setTurnAngle] = useState(0);

  const groupRef = useRef<Group>(null);
  const lastTriggerTime = useRef(0);

  const triggerHaptic = (intensity: number, duration: number) => {
    if (!hapticEnabled) return;

    [leftInputSourceState, rightInputSourceState].forEach((inputSourceState) => {
      if (inputSourceState?.inputSource?.gamepad?.hapticActuators) {
        inputSourceState.inputSource.gamepad.hapticActuators.forEach((actuator: any) => {
          actuator.pulse?.(intensity, duration);
        });
      }
    });
  };

  useEffect(() => {
    if (!leftInputSourceState) return;

    const handleInput = () => {
      const now = Date.now();
      if (now - lastTriggerTime.current < 100) return;
      lastTriggerTime.current = now;

      const gamepad = leftInputSourceState?.inputSource?.gamepad;

      if (gamepad) {
        const buttons = gamepad.buttons;

        if (navigationSettings.teleportEnabled && buttons[0]?.pressed) {
          setTeleportActive(true);
          triggerHaptic(0.3, 10);
        } else if (teleportActive && !buttons[0]?.pressed) {
          if (teleportPosition && teleportValid) {
            const player = groupRef.current?.parent;
            if (player) {
              player.position.x = teleportPosition[0];
              player.position.z = teleportPosition[2];
            }
            setTeleportActive(false);
            triggerHaptic(0.8, 20);
            setTeleportPosition(null);
          } else {
            setTeleportActive(false);
            setTeleportPosition(null);
          }
        }

        if (navigationSettings.turnType === 'snap' && buttons[3]?.pressed) {
          const axis = gamepad.axes[2];
          if (Math.abs(axis) > 0.5) {
            const direction = axis > 0 ? 1 : -1;
            const newAngle = direction * (navigationSettings.snapTurnAngle * Math.PI / 180);
            setTurnAngle(newAngle);
            triggerHaptic(0.4, 15);
          }
        }
      }
    };

    const interval = setInterval(handleInput, 50);

    return () => clearInterval(interval);
  }, [leftInputSourceState, teleportActive, teleportPosition, teleportValid, navigationSettings, hapticEnabled]);

  useEffect(() => {
    if (turnAngle !== 0 && groupRef.current) {
      const currentRotation = groupRef.current.rotation.y;
      groupRef.current.rotation.y = currentRotation + turnAngle;
      setTurnAngle(0);
    }
  }, [turnAngle]);

  const matrixHelper = useRef(new Matrix4());
  useXRHitTest(
    (results, getWorldMatrix) => {
      if (!teleportActive || !navigationSettings.teleportEnabled || results.length === 0) return;

      getWorldMatrix(matrixHelper.current, results[0]);
      const position = new Vector3();
      position.setFromMatrixPosition(matrixHelper.current);

      const isValid = position.y >= 0 && position.y < 3;
      setTeleportPosition([position.x, position.y, position.z]);
      setTeleportValid(isValid);
    },
    'viewer'
  );

  return (
    <group ref={groupRef}>
      {navigationSettings.teleportEnabled && teleportActive && teleportPosition && (
        <>
          <TeleportBeam
            inputSourceState={leftInputSourceState}
            active={teleportActive}
            valid={teleportValid}
          />
          <TeleportMarker
            position={teleportPosition}
            visible={teleportActive}
            valid={teleportValid}
          />
        </>
      )}

      {comfortSettings.vignetteEnabled && (
        <mesh position={[0, 0, -0.5]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={comfortSettings.vignetteIntensity * 0.3}
          />
        </mesh>
      )}

      {comfortSettings.tunnelingEnabled && (
        <group position={[0, 0, -0.6]}>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[0.3, 2, 32, 1, 0, Math.PI * 2]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={comfortSettings.tunnelingIntensity * 0.5}
              side={2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

interface SmoothLocomotionProps {
  speed?: number;
}

export function SmoothLocomotion({ speed = 1 }: SmoothLocomotionProps) {
  const camera = useThree((state) => state.camera);
  const inputSourceStates = useXRInputSourceStates();
  const leftInputSourceState = inputSourceStates.find(
    (state) => state.inputSource.handedness === 'left'
  );
  const navigationSettings = useXRStore((s) => s.navigationSettings);
  const hapticEnabled = useXRStore((s) => s.hapticEnabled);

  const velocity = useRef(new Vector3());
  const frame = useRef(0);

  useEffect(() => {
    if (!leftInputSourceState || !camera) return;

    const update = () => {
      frame.current = requestAnimationFrame(update);

      const gamepad = leftInputSourceState?.inputSource?.gamepad;
      if (!gamepad) return;

      const stickX = gamepad.axes[0];
      const stickY = gamepad.axes[1];

      if (Math.abs(stickX) < 0.1 && Math.abs(stickY) < 0.1) {
        velocity.current.set(0, 0, 0);
        return;
      }

      const actualSpeed = navigationSettings.movementSpeed * speed;
      const moveX = -stickX * actualSpeed * 0.01;
      const moveZ = -stickY * actualSpeed * 0.01;

      const rotation = camera.rotation.y;
      velocity.current.x = Math.cos(rotation) * moveX - Math.sin(rotation) * moveZ;
      velocity.current.z = Math.sin(rotation) * moveX + Math.cos(rotation) * moveZ;
      velocity.current.y = 0;

      camera.position.x += velocity.current.x;
      camera.position.z += velocity.current.z;
    };

    frame.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [leftInputSourceState, camera, navigationSettings, speed, hapticEnabled]);

  return null;
}

interface HeightAdjustmentProps {
  minHeight?: number;
  maxHeight?: number;
}

export function HeightAdjustment({ minHeight = 0.5, maxHeight = 2 }: HeightAdjustmentProps) {
  const camera = useThree((state) => state.camera);
  const inputSourceStates = useXRInputSourceStates();
  const leftInputSourceState = inputSourceStates.find(
    (state) => state.inputSource.handedness === 'left'
  );
  const navigationSettings = useXRStore((s) => s.navigationSettings);
  const hapticEnabled = useXRStore((s) => s.hapticEnabled);

  useEffect(() => {
    if (!leftInputSourceState || !camera) return;

    const handleInput = () => {
      const gamepad = leftInputSourceState?.inputSource?.gamepad;
      if (!gamepad) return;

      const gripButton = gamepad.buttons[1];
      const aButton = gamepad.buttons[4];

      if (gripButton?.pressed) {
        const newHeight = Math.max(minHeight, Math.min(maxHeight, camera.position.y + 0.01));
        camera.position.y = newHeight;
        if (hapticEnabled) {
          leftInputSourceState?.inputSource?.gamepad?.hapticActuators?.[0]?.pulse?.(0.2, 5);
        }
      }

      if (aButton?.pressed) {
        const newHeight = Math.max(minHeight, Math.min(maxHeight, camera.position.y - 0.01));
        camera.position.y = newHeight;
        if (hapticEnabled) {
          leftInputSourceState?.inputSource?.gamepad?.hapticActuators?.[0]?.pulse?.(0.2, 5);
        }
      }
    };

    const interval = setInterval(handleInput, 50);

    return () => clearInterval(interval);
  }, [leftInputSourceState, camera, minHeight, maxHeight, navigationSettings, hapticEnabled]);

  return null;
}
