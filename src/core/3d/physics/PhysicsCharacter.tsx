// PhysicsCharacter - Personnage avec physique Cannon
'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Raycaster, Plane } from 'three';
import * as THREE from 'three';
import type { WorldType } from '../scenes/types';
import { useCharacterStore } from '@/store/3d-character-store';

const CHARACTER_RADIUS = 0.4;
const CHARACTER_MASS = 5;

interface PhysicsCharacterProps {
  worldType: WorldType;
  onTargetSet?: (pos: Vector3 | null) => void;
  onSprintChange?: (sprinting: boolean) => void;
}

export function PhysicsCharacter({ worldType, onTargetSet, onSprintChange }: PhysicsCharacterProps) {
  const { camera } = useThree();
  const [sphereRef, api] = useSphere(() => ({
    type: 'Kinematic', // Kinematic = contrôlé par code, pas par forces
    position: [0, 0.4, 0], // Position initiale au sol (rayon = 0.4)
    args: [CHARACTER_RADIUS],
    material: { friction: 0.3, restitution: 0.1 },
  }));

  const keys = useRef({ forward: false, backward: false, left: false, right: false, sprint: false });
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const targetVelocity = useRef([0, 0, 0]);
  const targetPosition = useRef<Vector3 | null>(null);
  const visualGroupRef = useRef<THREE.Group>(null);
  const setPosition = useCharacterStore((s) => s.setPosition);

  const colors = {
    dev: { body: '#d4af37', glow: '#8b0000', sprint: '#ff6b00' },
    art: { body: '#ff6b6b', glow: '#4ecdc4', sprint: '#feca57' },
  }[worldType];

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'KeyZ': case 'ArrowUp': keys.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = true; break;
        case 'KeyA': case 'KeyQ': case 'ArrowLeft': keys.current.left = true; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.sprint = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'KeyZ': case 'ArrowUp': keys.current.forward = false; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = false; break;
        case 'KeyA': case 'KeyQ': case 'ArrowLeft': keys.current.left = false; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.sprint = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Right click to move with proper raycast
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 2) return;
      e.preventDefault();

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      const x = Math.max(-45, Math.min(45, intersection.x));
      const z = Math.max(-45, Math.min(45, intersection.z));

      // Stocker la position cible pour le mouvement continu
      targetPosition.current = new Vector3(x, 0.5, z);
      setIsMoving(true);
      if (onTargetSet) onTargetSet(targetPosition.current);
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, onTargetSet]);

  // Update velocity from keys
  useEffect(() => {
    const intervalId = setInterval(() => {
      let moveX = 0, moveZ = 0;
      if (keys.current.forward) moveZ -= 1;
      if (keys.current.backward) moveZ += 1;
      if (keys.current.left) moveX -= 1;
      if (keys.current.right) moveX += 1;

      // Si keys sont pressés, on annule la cible du clic et on contrôle direct
      if (moveX !== 0 || moveZ !== 0) {
        targetPosition.current = null;
        const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        const baseSpeed = keys.current.sprint ? 13 : 8;
        targetVelocity.current = [(moveX / len) * baseSpeed, 0, (moveZ / len) * baseSpeed];
        setIsMoving(true);
      } else if (!targetPosition.current) {
        // Pas de keys et pas de cible = arrêt
        targetVelocity.current = [0, 0, 0];
        setIsMoving(false);
      }
    }, 16);
    return () => clearInterval(intervalId);
  }, []);

  useFrame(() => {
    if (!api) return;

    const sprinting = keys.current.sprint;
    setIsSprinting(sprinting);
    onSprintChange?.(sprinting);

    // Mouvement vers cible (clic)
    if (targetPosition.current) {
      const dx = targetPosition.current.x - sphereRef.current.position.x;
      const dz = targetPosition.current.z - sphereRef.current.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.3) {
        const speed = sprinting ? 13 : 8;
        const moveX = (dx / dist) * speed;
        const moveZ = (dz / dist) * speed;

        // Pour Kinematic: déplacer directement la position
        const newX = sphereRef.current.position.x + moveX * 0.016;
        const newZ = sphereRef.current.position.z + moveZ * 0.016;
        api.position.set(newX, 0.4, newZ);

        targetVelocity.current = [moveX, 0, moveZ];
        setIsMoving(true);
      } else {
        targetPosition.current = null;
        targetVelocity.current = [0, 0, 0];
        setIsMoving(false);
        if (onTargetSet) onTargetSet(null);
      }
    } else if (targetVelocity.current[0] !== 0 || targetVelocity.current[2] !== 0) {
      // Contrôle par clavier
      const newX = sphereRef.current.position.x + targetVelocity.current[0] * 0.016;
      const newZ = sphereRef.current.position.z + targetVelocity.current[2] * 0.016;
      api.position.set(newX, 0.4, newZ);
      setIsMoving(true);
    } else {
      setIsMoving(false);
    }

    // Sync visual group with physics body position
    if (sphereRef.current && visualGroupRef.current) {
      const pos = sphereRef.current.position;
      visualGroupRef.current.position.set(pos.x, pos.y, pos.z);
      setPosition([pos.x, pos.y, pos.z]);
    }
  });

  return (
    <>
      {/* Corps physique invisible */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[CHARACTER_RADIUS, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Visual model - suit la position du corps physique via ref */}
      <group ref={visualGroupRef}>
        {/* Ombre portée */}
        <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[isSprinting ? 0.6 : 0.5, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.5, isSprinting ? 0.9 : 0.7, 32]} />
          <meshBasicMaterial color={isSprinting ? colors.sprint : colors.glow} transparent opacity={isMoving ? 0.6 : 0.3} />
        </mesh>

        {/* Corps */}
        <group>
          <mesh position={[0, 1.3, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={colors.body} roughness={0.3} metalness={0.5} emissive={isSprinting ? colors.sprint : colors.body} emissiveIntensity={isSprinting ? 0.5 : 0.2} />
          </mesh>
          <mesh position={[0, 0.65, 0]} castShadow>
            <capsuleGeometry args={[0.22, 0.55, 8, 16]} />
            <meshStandardMaterial color={colors.body} roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[-0.28, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color={colors.body} metalness={0.6} />
          </mesh>
          <mesh position={[0.28, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color={colors.body} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.15, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.18, 0.35, 4]} />
            <meshBasicMaterial color={isSprinting ? colors.sprint : colors.glow} transparent opacity={0.8} />
          </mesh>
        </group>

        {/* Particules de mouvement */}
        {isMoving && (
          <>
            <mesh position={[-0.35, 0.1, -0.25]}>
              <sphereGeometry args={[0.06, 4, 4]} />
              <meshBasicMaterial color={isSprinting ? colors.sprint : colors.glow} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.35, 0.1, -0.25]}>
              <sphereGeometry args={[0.06, 4, 4]} />
              <meshBasicMaterial color={isSprinting ? colors.sprint : colors.glow} transparent opacity={0.6} />
            </mesh>
          </>
        )}
      </group>
    </>
  );
}
