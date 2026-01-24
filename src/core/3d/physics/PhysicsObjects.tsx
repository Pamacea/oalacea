// PhysicsObjects - Objets physiques avec Cannon
'use client';

import { usePlane, useBox } from '@react-three/cannon';

// Sol fixe pour la physique
export function PhysicsGround() {
  const [ref] = usePlane(() => ({
    type: 'Static',
    position: [0, 0, 0],
  }));
  return (
    <mesh ref={ref} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

// Pillier gothique - Box statique
export function PhysicsPillar({ position }: { position: [number, number, number] }) {
  const [ref] = useBox(() => ({ type: 'Static', position, args: [1.5, 8, 1.5] }));
  return (
    <group position={position}>
      <mesh ref={ref} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh position={[0, 4.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.8, 3]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} emissive="#d4af37" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// Terminal - Box statique avec collision précise
export function PhysicsTerminal({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [position[0], position[1] + 1.5, position[2]],
    args: [1, 3, 0.5],
  }));

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={ref} castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2, 0.51]}>
        <planeGeometry args={[1.6, 1.5]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 2.5, 1]} color="#00ff88" intensity={1} distance={5} decay={2} />
    </group>
  );
}

// Monolithe central
export function PhysicsMonolith({ position }: { position: [number, number, number] }) {
  const [ref] = useBox(() => ({ type: 'Static', position: [position[0], 5, position[2]], args: [6, 10, 2] }));
  return (
    <group position={position}>
      <mesh ref={ref} castShadow receiveShadow position={[0, 5, 0]}>
        <boxGeometry args={[6, 10, 2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 5, 1.1]} castShadow>
        <boxGeometry args={[6.2, 10.2, 0.2]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} emissive="#d4af37" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

// Arc gothique
export function PhysicsArch({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  const [leftRef] = useBox(() => ({
    type: 'Static',
    position: [position[0] - 3, position[1] + 6, position[2]],
    args: [1, 12, 1],
  }));
  const [rightRef] = useBox(() => ({
    type: 'Static',
    position: [position[0] + 3, position[1] + 6, position[2]],
    args: [1, 12, 1],
  }));

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={leftRef} castShadow>
        <boxGeometry args={[1, 12, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh ref={rightRef} castShadow>
        <boxGeometry args={[1, 12, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[0, 12, 0]} castShadow>
        <torusGeometry args={[3, 0.4, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} emissive="#d4af37" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// Art World - Mur de béton
export function PhysicsWall({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [position[0], position[1] + 4, position[2]],
    args: [1, 8, 1],
  }));

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={ref} castShadow receiveShadow>
        <boxGeometry args={[1, 8, 1]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4, 0.51]}>
        <planeGeometry args={[0.8, 2]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
      </mesh>
      <pointLight position={[0, 5, 1]} color="#ff6b6b" intensity={2} distance={8} decay={2} />
    </group>
  );
}

// Art World - Pedestal
export function PhysicsPedestal({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [position[0], position[1] + 1, position[2]],
    args: [1.5, 2, 1.5],
  }));

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh ref={ref} castShadow receiveShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[1.5, 2, 2, 6]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.5, 0.3, 6]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}
