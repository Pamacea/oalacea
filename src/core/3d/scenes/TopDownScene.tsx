// TopDownScene - Scène isométrique style LoL
// Contrôles: Clic droit pour se déplacer, Shift pour sprint
// Barre espace: Toggle caméra follow vs free
'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Vector2, Vector3, Group, Raycaster } from 'three';
import * as THREE from 'three';
import type { WorldType } from './types';
import { DevWorld, ArtWorld } from './worlds';
import { DEV_COLLISION_ZONES, ART_COLLISION_ZONES } from './collisions';
import { navigationGrid } from './pathfinding';

interface CharacterProps {
  worldType: WorldType;
  positionRef?: React.MutableRefObject<Vector3>;
  onTargetSet?: (pos: Vector3 | null) => void;
  onSprintChange?: (sprinting: boolean) => void;
}

// Character contrôlable - click to move style LoL avec pathfinding
function Character({ worldType, positionRef, onTargetSet, onSprintChange }: CharacterProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const pathRef = useRef<Vector3[]>([]); // Chemin complet à suivre
  const currentWaypointRef = useRef<Vector3 | null>(null); // Waypoint actuel
  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Position locale (si pas de ref fournie, on utilise useState)
  const [localPosition, setLocalPosition] = useState(new Vector3(0, 0.5, 0));

  // Input tracking
  const keys = useRef({
    sprint: false,
  });

  // Couleurs selon le monde
  const colors = {
    dev: {
      body: '#d4af37',
      glow: '#8b0000',
      sprint: '#ff6b00',
    },
    art: {
      body: '#ff6b6b',
      glow: '#4ecdc4',
      sprint: '#feca57',
    },
  }[worldType];

  // Zones de collision selon le monde
  const collisionZones = worldType === 'dev' ? DEV_COLLISION_ZONES : ART_COLLISION_ZONES;

  // Setup keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keys.current.sprint = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keys.current.sprint = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Click droit pour se déplacer avec pathfinding
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Clic droit seulement
      if (e.button === 2) {
        e.preventDefault();

        if (!camera) return;

        // Raycaster pour trouver la position du sol cliqué
        const raycaster = new Raycaster();
        const mouse = new Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);

        // Plan du sol
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new Vector3();

        raycaster.ray.intersectPlane(plane, intersection);

        // Limiter à la zone de jeu
        let x = Math.max(-45, Math.min(45, intersection.x));
        let z = Math.max(-45, Math.min(45, intersection.z));

        const clickedPos = new Vector3(x, 0.5, z);
        const currentPos = positionRef?.current || localPosition;

        // Mettre à jour la grille de navigation avec les zones de collision actuelles
        navigationGrid.updateCollisionZones(collisionZones);

        // Calculer le chemin avec A*
        const path = navigationGrid.findPath(currentPos, clickedPos);

        if (path.length > 0) {
          pathRef.current = path;
          // Le premier waypoint est la position actuelle, on le skip
          if (path.length > 1) {
            currentWaypointRef.current = path[1];
            onTargetSet?.(path[path.length - 1]); // Dernier point = destination finale
          } else {
            currentWaypointRef.current = path[0];
            onTargetSet?.(path[0]);
          }
        }
      }
    };

    // Empêcher le menu contextuel clic droit
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, collisionZones, positionRef, localPosition, onTargetSet]);

  // Game loop - déplacement du personnage avec pathfinding
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const baseSpeed = 12;
    const sprintMultiplier = 1.6;
    const speed = isSprinting ? baseSpeed * sprintMultiplier : baseSpeed;
    const rotSpeed = 15;

    // Gestion du sprint
    const sprinting = keys.current.sprint;
    setIsSprinting(sprinting);
    onSprintChange?.(sprinting);

    const currentPos = positionRef?.current || localPosition;

    // Suivre le chemin calculé par A*
    if (currentWaypointRef.current) {
      const targetPos = currentWaypointRef.current;
      const dx = targetPos.x - currentPos.x;
      const dz = targetPos.z - currentPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.3) {
        setIsMoving(true);

        // Rotation vers la cible
        const targetRotation = Math.atan2(dx, dz);
        const rotDiff = targetRotation - rotation;
        const shortestRot = ((rotDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
        setRotation(r => r + shortestRot * delta * rotSpeed);

        // Déplacement vers le waypoint
        const moveDist = speed * delta;
        const ratio = Math.min(moveDist / distance, 1);

        const newX = currentPos.x + dx * ratio;
        const newZ = currentPos.z + dz * ratio;
        const newPos = new Vector3(newX, 0.5, newZ);

        // Mettre à jour la position (pas de vérif de collision pendant le mouvement sur le chemin)
        setLocalPosition(newPos);
        if (positionRef) {
          positionRef.current.copy(newPos);
        }
      } else {
        // Arrivé au waypoint actuel, passer au suivant
        const path = pathRef.current;
        const currentIndex = path.findIndex(p =>
          Math.abs(p.x - targetPos.x) < 0.1 && Math.abs(p.z - targetPos.z) < 0.1
        );

        if (currentIndex >= 0 && currentIndex < path.length - 1) {
          // Passer au waypoint suivant
          currentWaypointRef.current = path[currentIndex + 1];
        } else {
          // Dernier waypoint atteint, fin du chemin
          currentWaypointRef.current = null;
          pathRef.current = [];
          onTargetSet?.(null);
          setIsMoving(false);
        }
      }
    } else if (pathRef.current.length === 0) {
      setIsMoving(false);
    }

    // Position pour les calculs (priorité à la ref si fournie)
    const position = positionRef?.current || localPosition;

    // Appliquer position et rotation au mesh
    groupRef.current.position.copy(position);
    groupRef.current.rotation.y = rotation;
  });

  return (
    <group ref={groupRef}>
      {/* Ombre portée */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isSprinting ? 0.6 : 0.5, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Glow sous le personnage */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[0.5, isSprinting ? 0.9 : 0.7, 32]}
        />
        <meshBasicMaterial
          color={isSprinting ? colors.sprint : colors.glow}
          transparent
          opacity={isMoving ? 0.6 : 0.3}
        />
      </mesh>

      {/* Corps du personnage - forme humanoïde style LoL */}
      <group position={[0, 0, 0]}>
        {/* Tête */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial
            color={colors.body}
            roughness={0.3}
            metalness={0.5}
            emissive={isSprinting ? colors.sprint : colors.body}
            emissiveIntensity={isSprinting ? 0.5 : 0.2}
          />
        </mesh>

        {/* Corps */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.55, 8, 16]} />
          <meshStandardMaterial
            color={colors.body}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Épaules */}
        <mesh position={[-0.28, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color={colors.body} metalness={0.6} />
        </mesh>
        <mesh position={[0.28, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color={colors.body} metalness={0.6} />
        </mesh>

        {/* Indicateur de direction (flèche devant) */}
        <mesh position={[0, 0.15, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.18, 0.35, 4]} />
          <meshBasicMaterial
            color={isSprinting ? colors.sprint : colors.glow}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Particules de mouvement */}
      {isMoving && (
        <>
          <mesh position={[-0.35, 0.1, -0.25]}>
            <sphereGeometry args={[0.06, 4, 4]} />
            <meshBasicMaterial
              color={isSprinting ? colors.sprint : colors.glow}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh position={[0.35, 0.1, -0.25]}>
            <sphereGeometry args={[0.06, 4, 4]} />
            <meshBasicMaterial
              color={isSprinting ? colors.sprint : colors.glow}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {/* Visualisation du chemin A* */}
      {pathRef.current.length > 1 && (
        <group>
          {pathRef.current.map((point, i) => {
            // Skip le premier point (position actuelle du perso)
            if (i === 0) return null;
            return (
              <mesh key={`path-${i}`} position={[point.x, 0.06, point.z]}>
                <circleGeometry args={[0.3, 8]} />
                <meshBasicMaterial
                  color={isSprinting ? colors.sprint : colors.glow}
                  transparent
                  opacity={0.4}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

// Caméra isométrique qui suit le personnage
interface FollowCameraProps {
  targetRef: React.MutableRefObject<Vector3>;
  mode: 'follow' | 'free';
}

function FollowCamera({ targetRef, mode }: FollowCameraProps) {
  const ref = useRef<THREE.PerspectiveCamera>(null);

  // Offset isométrique style LoL (angle diagonal constant)
  // La caméra garde toujours le même angle par rapport au sol
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
      // Mode follow: caméra isométrique relative au personnage
      const target = targetRef.current;
      const targetX = target.x + isoOffset.x;
      const targetY = isoOffset.y;
      const targetZ = target.z + isoOffset.z;

      // Lissage du mouvement de caméra
      cameraTarget.current.x += (targetX - cameraTarget.current.x) * 0.08;
      cameraTarget.current.y += (targetY - cameraTarget.current.y) * 0.08;
      cameraTarget.current.z += (targetZ - cameraTarget.current.z) * 0.08;

      ref.current.position.set(
        cameraTarget.current.x,
        cameraTarget.current.y,
        cameraTarget.current.z
      );

      // Regarder vers le personnage
      ref.current.lookAt(target.x, 0, target.z);
    } else {
      // Mode free: bouger sur X/Z avec le même angle isométrique
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

      // En mode free, regarder vers le centre
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

// Scène complète
interface TopDownSceneProps {
  worldType: WorldType;
  cameraMode?: 'follow' | 'free';
}

export function TopDownScene({ worldType, cameraMode: externalCameraMode }: TopDownSceneProps) {
  const characterPositionRef = useRef(new Vector3(0, 0.5, 0));
  const [internalCameraMode, setInternalCameraMode] = useState<'follow' | 'free'>('follow');

  // Utiliser le mode externe si fourni, sinon le mode interne
  const cameraMode = externalCameraMode ?? internalCameraMode;
  const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null);
  const [isSprinting, setIsSprinting] = useState(false);

  // Couleurs du monde
  const colors = {
    dev: {
      ground: '#1a1a1a',
      grid: '#333333',
      gridAlt: '#2a2a2a',
      accent: '#d4af37',
      pillar: '#2a2a2a',
    },
    art: {
      ground: '#16213e',
      grid: '#2a2a4a',
      gridAlt: '#1e1e3a',
      accent: '#ff6b6b',
      pillar: '#1e1e3a',
    },
  }[worldType];

  return (
    <>
      {/* Monde spécifique selon le type */}
      {worldType === 'dev' ? <DevWorld /> : <ArtWorld />}

      {/* Sol commun aux deux mondes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={colors.ground} roughness={0.9} />
      </mesh>

      {/* Grille subtile pour repères visuels */}
      <gridHelper args={[100, 50, colors.grid, colors.gridAlt]} position={[0, 0, 0]} />

      {/* Zones d'interaction (Blog, Portfolios, About) */}
      <group>
        {[
          { pos: [-15, 0, -15], color: colors.accent, label: 'Blog' },
          { pos: [15, 0, -15], color: colors.accent, label: 'Portfolio Dev' },
          { pos: [-15, 0, 15], color: colors.accent, label: 'Portfolio Art' },
          { pos: [15, 0, 15], color: colors.accent, label: 'About' },
        ].map((zone, i) => (
          <group key={`zone-${i}`}>
            <mesh
              position={[zone.pos[0], 0.02, zone.pos[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[2.5, 3, 32]} />
              <meshBasicMaterial color={zone.color} transparent opacity={0.3} />
            </mesh>
            <mesh position={[zone.pos[0], 0.5, zone.pos[2]]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.8} />
            </mesh>
            <pointLight
              position={[zone.pos[0], 3, zone.pos[2]]}
              color={zone.color}
              intensity={2}
              distance={8}
              decay={2}
            />
          </group>
        ))}
      </group>

      {/* Personnage contrôlable */}
      <Character
        worldType={worldType}
        positionRef={characterPositionRef}
        onTargetSet={(pos) => setTargetPosition(pos)}
        onSprintChange={setIsSprinting}
      />

      {/* Indicateur de destination - coordonnées monde absolues */}
      {targetPosition && (
        <mesh position={[targetPosition.x, 0.05, targetPosition.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.8, 32]} />
          <meshBasicMaterial
            color={isSprinting ? '#ff6b00' : worldType === 'dev' ? '#8b0000' : '#4ecdc4'}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Caméra isométrique qui suit le personnage ou libre */}
      <FollowCamera targetRef={characterPositionRef} mode={cameraMode} />
    </>
  );
}
