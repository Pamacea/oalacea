# Oalacea 3D Architecture - Portfolio Immersif

> Architecture technique complète pour un portfolio 3D inspiré de Bruno Simon avec deux mondes explorables

**Version:** 1.0.0
**Last Updated:** 2026-01-24
**Status:** Draft

---

## Table of Contents

1. [Vision Overview](#vision-overview)
2. [Stack 3D](#stack-3d)
3. [Architecture des Deux Mondes](#architecture-des-deux-mondes)
4. [Controle du Personnage](#controle-du-personnage)
5. [UI Flottante](#ui-flottante)
6. [Structure du Projet](#structure-du-projet)
7. [Roadmap d'Implementation](#roadmap-dimplementation)
8. [Code Examples](#code-examples)

---

## Vision Overview

### Concept

Un portfolio 3D immersif ou l'utilisateur contrôle un personnage fantasy pour explorer deux mondes distincts :

```
                    ┌─────────────────────────────────┐
                    │       OALACEA 3D PORTFOLIO       │
                    └─────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
    ┌──────────────┐        ┌──────────────┐          ┌──────────────┐
    │  MONDE DEV   │        │  MONDE ART   │          │     UI       │
    │              │        │              │          │  Flottante   │
    │ Imperium     │        │ Brutal       │          │              │
    │ Warhammer    │   <->   │ Underground  │     +    │ Navigation  │
    │ 40k Style    │        │ Gothic       │          │ Blog/Portfolio│
    │              │        │ Museum       │          │              │
    └──────────────┘        └──────────────┘          └──────────────┘
            │                         │
            └─────────────────────────┼─────────────────────────┘
                                      │
                              ┌───────▼────────┐
                              │   PERSO 3D     │
                              │   Controllable │
                              └────────────────┘
```

### Les Deux Mondes

| Aspect | Monde Dev (Imperium) | Monde Art (Underground) |
|--------|---------------------|------------------------|
| **Palette** | Noir profond (`#0a0a0a`) + Or antique (`#d4af37`) | Graffiti vibrant + Dark gothic stone |
| **Ambiance** | Warhammer 40k, sombre, impérial | Street art, musée, underground |
| **Lighting** | Dramatique, torches, néons rouges | Néons colorés, spots museum |
| **Geometry** | Blocs angulaires, arsenaux, tech | Arches gothiques, tunnels, fresques |
| **Audio** | Chorals sombres, mécanique | Hip-hop, street sounds |

### Sources d'Inspiration

- [Third Person Controller R3F Tutorial](https://wawasensei.dev/tuto/third-person-controller-react-three-fiber-tutorial) - Architecture du contrôleur
- [pmndrs/ecctrl](https://github.com/pmndrs/ecctrl) - Librairie de contrôleur de personnage
- [Physics-Based Character Controller](https://tympanus.net/codrops/2025/05/28/building-a-physics-based-character-controller-with-the-help-of-ai/) - Tutoriel 2025 sur les contrôleurs physiques
- [R3F & Rapier Third Person](https://discourse.threejs.org/t/r3f-rapier-third-person-controller-and-follow-camera/48832) - Intégration R3F + Rapier

---

## Stack 3D

### Dependencies à Installer

```json
{
  "dependencies": {
    // Core 3D
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.114.0",
    "@react-three/postprocessing": "^2.16.0",
    "three": "^0.169.0",
    "three-stdlib": "^2.32.0",

    // Physics
    "@react-three/rapier": "^1.5.0",
    "rapier3d-compat": "^0.14.0",

    // Character Controller
    "ecctrl": "^1.2.0",

    // GLTF Loading
    "@react-three/gltfjsx": "^6.6.0",

    // Transitions
    "@theatre/core": "^0.7.0",
    "@theatre/r3f": "^0.7.0",

    // Camera Controls
    "@react-three/drei-camera-controls": "^0.1.0"
  },
  "devDependencies": {
    "gltfjsx": "^6.6.0",
    "@types/three": "^0.169.0"
  }
}
```

### Architecture des Libs

```
┌─────────────────────────────────────────────────────────────────┐
│                      THREE.JS ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    @react-three/fiber                    │  │
│  │              (React renderer for Three.js)                │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                         │                                 │  │
│  ▼                         ▼                                 │  │
│ ┌─────────────────┐  ┌─────────────────┐                     │  │
│ │  @react-three/  │  │  @react-three/  │                     │  │
│ │      drei       │  │     rapier      │                     │  │
│ │                 │  │                 │                     │  │
│ │ - GLTFLoader    │  │ - Physics World │                     │  │
│ │ - Camera        │  │ - Collisions    │                     │  │
│ │ - Environment   │  │ - RigidBody     │                     │  │
│ │ - Controls      │  │ - Joints        │                     │  │
│ │ - Textures      │  │                 │                     │  │
│ └─────────────────┘  └─────────────────┘                     │  │
│        │                   │                                   │  │
│        └─────────┬─────────┘                                   │  │
│                  ▼                                             │  │
│         ┌────────────────┐                                     │  │
│         │    ecctrl      │                                     │  │
│         │ (Character     │                                     │  │
│         │  Controller)   │                                     │  │
│         └────────────────┘                                     │  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Pourquoi ces Choix

| Librairie | Rôle | Pourquoi |
|-----------|------|----------|
| **@react-three/fiber** | Core 3D | Standard React + Three.js, RSC compatible |
| **@react-three/drei** | Helpers | Abstractions essentielles (Camera, Loader, etc.) |
| **@react-three/rapier** | Physique | Remplace Cannon.js, plus performant et maintenu |
| **ecctrl** | Character Controller | Solution prête à l'emploi, basée sur Rapier |
| **@theatre/core** | Transitions | Animations cinématiques entre mondes |

---

## Architecture des Deux Mondes

### Structure des Scènes

```typescript
// src/core/3d/scenes/types.ts
export type WorldType = 'dev' | 'art';

export interface WorldConfig {
  id: WorldType;
  name: string;
  colors: {
    background: string;
    ambient: string;
    fog: string;
    primary: string;
    secondary: string;
  };
  lighting: {
    ambientIntensity: number;
    directionalIntensity: number;
    pointLights: PointLightConfig[];
  };
  environment: {
    skybox: string;
    ground: string;
    objects: WorldObject[];
  };
  spawnPoint: [x: number, y: number, z: number];
}

export interface PointLightConfig {
  position: [number, number, number];
  color: string;
  intensity: number;
  decay: number;
}

export interface WorldObject {
  id: string;
  type: 'glb' | 'primitive' | 'text';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  model?: string; // Path to GLB
  interactable?: boolean;
  onClick?: string; // Navigation route
}
```

### Configuration des Mondes

```typescript
// src/config/3d/worlds.ts
import type { WorldConfig } from '@/core/3d/scenes/types';

export const DEV_WORLD: WorldConfig = {
  id: 'dev',
  name: 'Imperium Dev',
  colors: {
    background: '#0a0a0a',
    ambient: '#1a1a1a',
    fog: '#050505',
    primary: '#d4af37', // Gold
    secondary: '#8b0000', // Dark Red
  },
  lighting: {
    ambientIntensity: 0.3,
    directionalIntensity: 1,
    pointLights: [
      { position: [10, 10, 10], color: '#d4af37', intensity: 2, decay: 2 },
      { position: [-10, 5, -10], color: '#8b0000', intensity: 1.5, decay: 2 },
    ],
  },
  environment: {
    skybox: '/3d/env/dev/imperium.hdr',
    ground: '/3d/env/dev/stone-floor.glb',
    objects: [
      {
        id: 'dev-monolith',
        type: 'glb',
        position: [0, 0, -10],
        model: '/3d/models/dev/monolith.glb',
        interactable: true,
        onClick: '/portfolio/dev',
      },
      {
        id: 'dev-blog-terminal',
        type: 'glb',
        position: [-8, 0, -5],
        model: '/3d/models/dev/terminal.glb',
        interactable: true,
        onClick: '/blog',
      },
    ],
  },
  spawnPoint: [0, 1, 5],
};

export const ART_WORLD: WorldConfig = {
  id: 'art',
  name: 'Art Underground',
  colors: {
    background: '#1a1a2e',
    ambient: '#16213e',
    fog: '#0f0f23',
    primary: '#ff6b6b', // Neon Red
    secondary: '#4ecdc4', // Teal
  },
  lighting: {
    ambientIntensity: 0.4,
    directionalIntensity: 0.5,
    pointLights: [
      { position: [10, 10, 10], color: '#ff6b6b', intensity: 2, decay: 1.5 },
      { position: [-10, 5, -10], color: '#4ecdc4', intensity: 2, decay: 1.5 },
      { position: [0, 15, 0], color: '#feca57', intensity: 1, decay: 2 },
    ],
  },
  environment: {
    skybox: '/3d/env/art/underground.hdr',
    ground: '/3d/env/art/concrete-floor.glb',
    objects: [
      {
        id: 'art-gallery-frame',
        type: 'glb',
        position: [0, 0, -10],
        model: '/3d/models/art/gallery-frame.glb',
        interactable: true,
        onClick: '/portfolio/art',
      },
      {
        id: 'art-graffiti-wall',
        type: 'glb',
        position: [8, 0, -5],
        rotation: [0, Math.PI / 4, 0],
        model: '/3d/models/art/graffiti-wall.glb',
        interactable: true,
        onClick: '/about',
      },
    ],
  },
  spawnPoint: [0, 1, 5],
};
```

### Gestion du Changement de Monde

```typescript
// src/core/3d/scenes/WorldManager.tsx
'use client';

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Color, Vector3 } from 'three';
import * as THREE from 'three';
import type { WorldType, WorldConfig } from './types';
import { DEV_WORLD, ART_WORLD } from '@/config/3d/worlds';

interface WorldManagerProps {
  currentWorld: WorldType;
  onWorldChange?: (world: WorldType) => void;
}

export function WorldManager({ currentWorld, onWorldChange }: WorldManagerProps) {
  const { scene, camera } = useThree();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const worldConfigs: Record<WorldType, WorldConfig> = {
    dev: DEV_WORLD,
    art: ART_WORLD,
  };

  const currentConfig = worldConfigs[currentWorld];

  // Transition cinématique entre les mondes
  const transitionToWorld = async (targetWorld: WorldType) => {
    if (isTransitioning || targetWorld === currentWorld) return;
    setIsTransitioning(true);

    const targetConfig = worldConfigs[targetWorld];

    // 1. Fade out current scene
    await fadeScene(0, 500);

    // 2. Update scene configuration
    updateSceneConfig(targetConfig);

    // 3. Teleport character to spawn point
    // (handled by CharacterController)

    // 4. Fade in new scene
    await fadeScene(1, 500);

    onWorldChange?.(targetWorld);
    setIsTransitioning(false);
  };

  const fadeScene = (targetOpacity: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startOpacity = scene.fog?.density ?? 0;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Animate fog density for fade effect
        if (scene.fog) {
          scene.fog.density = startOpacity + (targetOpacity - startOpacity) * progress;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  const updateSceneConfig = (config: WorldConfig) => {
    // Background color
    scene.background = new Color(config.colors.background);

    // Fog
    scene.fog = new THREE.FogExp2(config.colors.fog, 0.02);

    // Clear existing lights
    const existingLights = scene.children.filter(
      (child) => child.type === 'AmbientLight' || child.type === 'PointLight'
    );
    existingLights.forEach((light) => scene.remove(light));

    // Add new lights
    const ambientLight = new THREE.AmbientLight(
      config.colors.ambient,
      config.lighting.ambientIntensity
    );
    scene.add(ambientLight);

    config.lighting.pointLights.forEach((lightConfig) => {
      const light = new THREE.PointLight(
        lightConfig.color,
        lightConfig.intensity,
        100,
        lightConfig.decay
      );
      light.position.set(...lightConfig.position);
      scene.add(light);
    });
  };

  useEffect(() => {
    updateSceneConfig(currentConfig);
  }, [currentConfig]);

  return null;
}
```

### Composant de Scene Container

```typescript
// src/core/3d/scenes/SceneContainer.tsx
'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Preload } from '@react-three/drei';
import type { WorldType } from './types';
import { WorldManager } from './WorldManager';
import { CharacterController } from '../character/CharacterController';
import { DevWorldObjects } from './worlds/DevWorldObjects';
import { ArtWorldObjects } from './worlds/ArtWorldObjects';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { LoadingScreen } from '@/components/3d/LoadingScreen';

interface SceneContainerProps {
  currentWorld: WorldType;
  onWorldChange: (world: WorldType) => void;
}

export function SceneContainer({ currentWorld, onWorldChange }: SceneContainerProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />

        <Suspense fallback={null}>
          <PhysicsWorld>
            <WorldManager currentWorld={currentWorld} onWorldChange={onWorldChange} />

            {/* Render current world objects */}
            {currentWorld === 'dev' && <DevWorldObjects />}
            {currentWorld === 'art' && <ArtWorldObjects />}

            <CharacterController currentWorld={currentWorld} />
          </PhysicsWorld>

          <Environment preset={currentWorld === 'dev' ? 'night' : 'city'} />
          <Preload all />
        </Suspense>
      </Canvas>
      <LoadingScreen />
    </div>
  );
}
```

---

## Controle du Personnage

### Inputs et Configuration

```typescript
// src/core/3d/character/types.ts
export interface CharacterInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
  interact: boolean;
}

export interface CharacterState {
  position: [number, number, number];
  rotation: number;
  velocity: [number, number, number];
  isGrounded: boolean;
  currentAnimation: string;
}

export type AnimationType =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'interact';
```

### Hook d'Input Management

```typescript
// src/hooks/useCharacterInputs.ts
'use client';

import { useEffect, useState } from 'react';
import type { CharacterInputs } from '@/core/3d/character/types';

const KEY_MAP = {
  // WASD
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  // ZQSD (AZERTY)
  KeyZ: 'forward',
  KeyQ: 'left',
  // Modifiers
  ShiftLeft: 'run',
  ShiftRight: 'run',
  Space: 'jump',
  KeyE: 'interact',
} as const;

export function useCharacterInputs() {
  const [inputs, setInputs] = useState<CharacterInputs>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    interact: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code as keyof typeof KEY_MAP];
      if (action && !inputs[action as keyof CharacterInputs]) {
        setInputs((prev) => ({ ...prev, [action]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code as keyof typeof KEY_MAP];
      if (action) {
        setInputs((prev) => ({ ...prev, [action]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return inputs;
}
```

### Character Controller avec ecctrl

```typescript
// src/core/3d/character/CharacterController.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, RigidBodyApi } from '@react-three/rapier';
import { Vector3, Quaternion, Group } from 'three';
import { useGLTF } from '@react-three/drei';
import type { WorldType, AnimationType } from './types';
import type { CharacterInputs } from './types';
import { useCharacterStore } from '@/store/3d-character-store';
import { DEV_WORLD, ART_WORLD } from '@/config/3d/worlds';

// Character model paths
const CHARACTER_MODELS = {
  dev: '/3d/characters/dev-hero.glb',
  art: '/3d/characters/art-hero.glb',
} as const;

interface CharacterControllerProps {
  currentWorld: WorldType;
}

export function CharacterController({ currentWorld }: CharacterControllerProps) {
  const characterRef = useRef<RigidBodyApi>(null);
  const groupRef = useRef<Group>(null);
  const inputs = useCharacterInputs();
  const setAnimation = useCharacterStore((s) => s.setAnimation);
  const setPosition = useCharacterStore((s) => s.setPosition);

  const { scene: characterScene } = useGLTF(CHARACTER_MODELS[currentWorld]);
  const worldConfig = currentWorld === 'dev' ? DEV_WORLD : ART_WORLD;

  // Animation state
  const animations = useGLTF(CHARACTER_MODELS[currentWorld]).animations;
  const currentAnimation = useCharacterStore((s) => s.currentAnimation);

  // Movement configuration
  const moveSpeed = inputs.run ? 8 : 4;
  const rotationSpeed = 4;

  useFrame((state, delta) => {
    if (!characterRef.current || !groupRef.current) return;

    const body = characterRef.current;
    const position = body.translation();
    const rotation = groupRef.current.rotation.y;

    // Calculate movement direction
    let moveDirection = new Vector3(0, 0, 0);

    if (inputs.forward) moveDirection.z -= 1;
    if (inputs.backward) moveDirection.z += 1;
    if (inputs.left) moveDirection.x -= 1;
    if (inputs.right) moveDirection.x += 1;

    // Normalize diagonal movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }

    // Rotate movement direction based on character rotation
    const rotatedDirection = moveDirection
      .clone()
      .applyAxisAngle(new Vector3(0, 1, 0), rotation);

    // Apply movement
    if (moveDirection.length() > 0) {
      body.setLinvel({
        x: rotatedDirection.x * moveSpeed,
        y: body.linvel().y,
        z: rotatedDirection.z * moveSpeed,
      });

      // Rotate character towards movement direction
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        rotation,
        targetRotation,
        rotationSpeed * delta
      );

      // Set animation
      const targetAnimation: AnimationType = inputs.run ? 'run' : 'walk';
      if (currentAnimation !== targetAnimation) {
        setAnimation(targetAnimation);
      }
    } else {
      // Stop horizontal movement
      body.setLinvel({
        x: 0,
        y: body.linvel().y,
        z: 0,
      });

      if (currentAnimation !== 'idle') {
        setAnimation('idle');
      }
    }

    // Jump
    if (inputs.jump) {
      // Check if grounded (raycast down)
      // For simplicity, assuming jump is available
      body.setLinvel({
        x: body.linvel().x,
        y: 7,
        z: body.linvel().z,
      });
    }

    // Update store position
    setPosition([position.x, position.y, position.z]);
  });

  // Handle world change - teleport to spawn
  useEffect(() => {
    if (characterRef.current) {
      const [x, y, z] = worldConfig.spawnPoint;
      characterRef.current.setTranslation({ x, y, z });
      characterRef.current.setLinvel({ x: 0, y: 0, z: 0 });
    }
  }, [currentWorld, worldConfig.spawnPoint]);

  return (
    <RigidBody
      ref={characterRef}
      colliders="hull"
      mass={1}
      type="dynamic"
      enabledRotations={[false, false, false]}
      position={worldConfig.spawnPoint}
    >
      <group ref={groupRef}>
        <primitive object={characterScene.clone()} />
      </group>
    </RigidBody>
  );
}
```

### Camera Follow (Third Person)

```typescript
// src/core/3d/camera/FollowCamera.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { Vector3, PerspectiveCamera } from 'three';
import { useCharacterStore } from '@/store/3d-character-store';

interface FollowCameraProps {
  offset?: [number, number, number]; // [x, y, z] offset from character
  lookAtOffset?: [number, number, number]; // Point to look at relative to character
  smoothFactor?: number; // Lower = smoother but more lag
}

export function FollowCamera({
  offset = [0, 5, 10],
  lookAtOffset = [0, 2, 0],
  smoothFactor = 0.1,
}: FollowCameraProps) {
  const cameraRef = useRef<PerspectiveCamera>(null);
  const { camera } = useThree();
  const characterPosition = useCharacterStore((s) => s.position);

  const targetPosition = new Vector3();
  const currentLookAt = new Vector3();

  useFrame(() => {
    if (!camera) return;

    // Calculate target camera position
    targetPosition.set(
      characterPosition[0] + offset[0],
      characterPosition[1] + offset[1],
      characterPosition[2] + offset[2]
    );

    // Calculate look-at point
    currentLookAt.set(
      characterPosition[0] + lookAtOffset[0],
      characterPosition[1] + lookAtOffset[1],
      characterPosition[2] + lookAtOffset[2]
    );

    // Smooth camera movement
    camera.position.lerp(targetPosition, smoothFactor);

    // Smooth look-at
    const currentLook = new Vector3();
    camera.getWorldDirection(currentLook);
    const targetLook = currentLookAt.clone().sub(camera.position).normalize();

    // We'll use lookAt for simplicity
    camera.lookAt(currentLookAt);
  });

  return null;
}
```

---

## UI Flottante

### Structure HTML/CSS

L'UI flottante est un calque HTML au-dessus du canvas 3D, utilisant le CSS existant (Tailwind + Shadcn UI).

```typescript
// src/components/3d/FloatingUI.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { WorldSwitch } from './WorldSwitch';
import { NavigationMenu } from './NavigationMenu';
import { InteractionPrompt } from './InteractionPrompt';
import { useCharacterStore } from '@/store/3d-character-store';

export function FloatingUI() {
  const [menuOpen, setMenuOpen] = useState(false);
  const canInteract = useCharacterStore((s) => s.canInteract);
  const interactTarget = useCharacterStore((s) => s.interactTarget);

  return (
    <>
      {/* Top bar - Logo + World Switch */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tighter">
            OALACEA
          </h1>
        </div>

        <WorldSwitch />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative"
        >
          <Icons.menu className="h-6 w-6" />
          {menuOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-primary/20"
            />
          )}
        </Button>
      </motion.header>

      {/* Navigation Menu - Opens from right */}
      <AnimatePresence>
        {menuOpen && (
          <NavigationMenu onClose={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>

      {/* Interaction Prompt - Shows when near interactable object */}
      <AnimatePresence>
        {canInteract && interactTarget && (
          <InteractionPrompt target={interactTarget} />
        )}
      </AnimatePresence>

      {/* Controls Help - Bottom right */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="rounded-lg bg-black/50 backdrop-blur-md p-4 text-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <kbd className="rounded bg-white/10 px-2 py-1">WASD</kbd>
              <span className="text-white/60">Move</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded bg-white/10 px-2 py-1">SHIFT</kbd>
              <span className="text-white/60">Run</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded bg-white/10 px-2 py-1">SPACE</kbd>
              <span className="text-white/60">Jump</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded bg-white/10 px-2 py-1">E</kbd>
              <span className="text-white/60">Interact</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading overlay */}
      <div id="loading-overlay" className="fixed inset-0 z-50 bg-black" />
    </>
  );
}
```

### World Switch Component

```typescript
// src/components/3d/WorldSwitch.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWorldStore } from '@/store/3d-world-store';
import type { WorldType } from '@/core/3d/scenes/types';

const WORLDS: Array<{
  id: WorldType;
  label: string;
  icon: string;
  color: string;
}> = [
  { id: 'dev', label: 'Dev World', icon: 'code', color: 'text-yellow-500' },
  { id: 'art', label: 'Art World', icon: 'palette', color: 'text-pink-500' },
];

export function WorldSwitch() {
  const { currentWorld, switchWorld } = useWorldStore();

  return (
    <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md p-1">
      {WORLDS.map((world) => (
        <Button
          key={world.id}
          variant={currentWorld === world.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchWorld(world.id)}
          className={currentWorld === world.id ? world.color : ''}
        >
          {world.label}
        </Button>
      ))}
    </div>
  );
}
```

### Navigation Menu

```typescript
// src/components/3d/NavigationMenu.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

const NAV_ITEMS = [
  {
    category: 'Portfolio',
    items: [
      { label: 'Dev Projects', href: '/portfolio/dev', icon: 'code' },
      { label: 'Art Projects', href: '/portfolio/art', icon: 'image' },
      { label: 'All Projects', href: '/portfolio', icon: 'folder' },
    ],
  },
  {
    category: 'Content',
    items: [
      { label: 'Blog', href: '/blog', icon: 'file-text' },
      { label: 'About', href: '/about', icon: 'user' },
      { label: 'Contact', href: '/contact', icon: 'mail' },
    ],
  },
];

interface NavigationMenuProps {
  onClose: () => void;
}

export function NavigationMenu({ onClose }: NavigationMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      />

      {/* Menu Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-background/95 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icons.close className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 px-6 py-4">
            <nav className="flex flex-col gap-6">
              {NAV_ITEMS.map((section) => (
                <div key={section.category}>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    {section.category}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {section.items.map((item) => {
                      const Icon = Icons[item.icon as keyof typeof Icons];
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Use WASD to explore the 3D world
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
```

### Interaction Prompt

```typescript
// src/components/3d/InteractionPrompt.tsx
'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface InteractionPromptProps {
  target: {
    name: string;
    route: string;
  };
}

export function InteractionPrompt({ target }: InteractionPromptProps) {
  const pathname = usePathname();

  if (pathname === target.route) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-4 rounded-full bg-black/70 px-6 py-3 backdrop-blur-md">
        <span className="text-sm font-medium">{target.name}</span>
        <div className="flex items-center gap-2">
          <kbd className="rounded bg-white/10 px-2 py-1 text-xs">E</kbd>
          <span className="text-xs text-white/60">to view</span>
        </div>
        <Button size="sm" variant="ghost" asChild>
          <a href={target.route}>
            <Icons.arrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
```

---

## Structure du Projet

### Arborescence Complète

```
oalacea/
├── public/
│   └── 3d/                          # 3D Assets (servis statiquement)
│       ├── characters/              # Personnage 3D
│       │   ├── dev-hero.glb         # Personnage monde Dev
│       │   ├── dev-hero-textures/   # Textures séparées si besoin
│       │   ├── art-hero.glb         # Personnage monde Art
│       │   └── art-hero-textures/
│       │
│       ├── models/                  # Objets de decor
│       │   ├── dev/
│       │   │   ├── monolith.glb     # Objet interactif Dev
│       │   │   ├── terminal.glb     # Terminal pour blog
│       │   │   └── server-rack.glb  # Decor
│       │   └── art/
│       │       ├── gallery-frame.glb # Cadre pour portfolio
│       │       ├── graffiti-wall.glb # Mur interactif
│       │       └── pedestal.glb     # Socle exposition
│       │
│       ├── env/                     # Environments
│       │   ├── dev/
│       │   │   ├── imperium.hdr     # HDRI pour lighting
│       │   │   ├── stone-floor.glb  # Sol
│       │   │   └── arena-collision.glb # Collisions
│       │   └── art/
│       │       ├── underground.hdr
│       │       ├── concrete-floor.glb
│       │       └── tunnel-collision.glb
│       │
│       └── audio/                   # Sons ambiances
│           ├── dev-ambient.mp3
│           ├── art-ambient.mp3
│           └── footsteps.mp3
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout avec Canvas 3D
│   │   ├── page.tsx                 # Page d'accueil (avec 3D)
│   │   ├── (3d)/                   # Routes accessible via 3D
│   │   │   └── ...
│   │   ├── (marketing)/             # Pages marketing classiques
│   │   └── (blog)/                  # Blog
│   │
│   ├── components/
│   │   ├── 3d/                      # Components UI 3D-specific
│   │   │   ├── FloatingUI.tsx
│   │   │   ├── WorldSwitch.tsx
│   │   │   ├── NavigationMenu.tsx
│   │   │   ├── InteractionPrompt.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── Minimap.tsx          # Optionnel
│   │   │
│   │   └── ui/                      # Shadcn UI (existant)
│   │
│   ├── core/
│   │   └── 3d/                      # Core 3D logic
│   │       ├── scenes/              # Scene management
│   │       │   ├── types.ts
│   │       │   ├── SceneContainer.tsx
│   │       │   ├── WorldManager.tsx
│   │       │   ├── worlds/
│   │       │   │   ├── DevWorldObjects.tsx
│   │       │   │   └── ArtWorldObjects.tsx
│   │       │
│   │       ├── character/           # Character controller
│   │       │   ├── types.ts
│   │       │   ├── CharacterController.tsx
│   │       │   └── animations/
│   │       │       └── AnimationMixer.tsx
│   │       │
│   │       ├── camera/              # Camera system
│   │       │   ├── FollowCamera.tsx
│   │       │   └── CameraControls.tsx
│   │       │
│   │       ├── physics/             # Physics wrapper
│   │       │   ├── PhysicsWorld.tsx
│   │       │   └── collisions.ts
│   │       │
│   │       └── interactions/        # 3D interactions
│   │           ├── ProximityDetector.ts
│   │           └── InteractionZone.tsx
│   │
│   ├── hooks/
│   │   ├── useCharacterInputs.ts    # Keyboard/mouse input
│   │   ├── useProximity.ts          # Detect nearby objects
│   │   └── useWorldTransition.ts    # Handle world switch
│   │
│   ├── store/
│   │   ├── 3d-character-store.ts    # Character state
│   │   ├── 3d-world-store.ts        # Current world, loading
│   │   └── 3d-audio-store.ts        # Audio state
│   │
│   ├── config/
│   │   └── 3d/
│   │       ├── worlds.ts            # World configurations
│   │       └── character.ts         # Character settings
│   │
│   └── lib/
│       └── 3d/
│           ├── gltf-loader.ts       # Utilities for loading models
│           └── animation-utils.ts   # Animation helpers
│
└── docs/
    ├── architecture.md              # Architecture existante
    └── 3d-architecture.md           # Ce document
```

### Stores Zustand pour le 3D

```typescript
// src/store/3d-character-store.ts
import { create } from 'zustand';
import type { AnimationType } from '@/core/3d/character/types';

interface CharacterState {
  // Position
  position: [number, number, number];
  setPosition: (pos: [number, number, number]) => void;

  // Animation
  currentAnimation: AnimationType;
  setAnimation: (anim: AnimationType) => void;

  // Interaction
  canInteract: boolean;
  interactTarget: { name: string; route: string } | null;
  setCanInteract: (can: boolean, target?: { name: string; route: string }) => void;

  // World-specific
  currentWorld: 'dev' | 'art';
  setCurrentWorld: (world: 'dev' | 'art') => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  position: [0, 1, 5],
  setPosition: (pos) => set({ position: pos }),

  currentAnimation: 'idle',
  setAnimation: (anim) => set({ currentAnimation: anim }),

  canInteract: false,
  interactTarget: null,
  setCanInteract: (can, target) =>
    set({ canInteract: can, interactTarget: target ?? null }),

  currentWorld: 'dev',
  setCurrentWorld: (world) => set({ currentWorld: world }),
}));
```

```typescript
// src/store/3d-world-store.ts
import { create } from 'zustand';
import type { WorldType } from '@/core/3d/scenes/types';

interface WorldState {
  currentWorld: WorldType;
  isTransitioning: boolean;
  switchWorld: (world: WorldType) => Promise<void>;
  loadingProgress: number;
  setLoadingProgress: (progress: number) => void;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  currentWorld: 'dev',
  isTransitioning: false,
  loadingProgress: 0,

  switchWorld: async (world: WorldType) => {
    if (get().isTransitioning) return;

    set({ isTransitioning: true, loadingProgress: 0 });

    // Simulate loading progress (in real app, track asset loading)
    const interval = setInterval(() => {
      const current = get().loadingProgress;
      if (current >= 100) {
        clearInterval(interval);
        set({ currentWorld: world, isTransitioning: false, loadingProgress: 0 });
      } else {
        set({ loadingProgress: current + 10 });
      }
    }, 100);
  },

  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
}));
```

```typescript
// src/store/index.ts - Mise a jour
export * from './ui-store';
export * from './3d-character-store';
export * from './3d-world-store';
export * from './3d-audio-store';
```

---

## Roadmap d'Implementation

### Phase 1: Fondation Technique (Semaine 1-2)

**Objectifs:** Mise en place de l'infrastructure 3D de base

#### Taches

| # | Tache | Fichiers | Estimation |
|---|-------|----------|------------|
| 1.1 | Installer les dependances 3D | `package.json` | 1h |
| 1.2 | Creer la structure de dossiers 3D | `src/core/3d/`, `public/3d/` | 1h |
| 1.3 | Configurer le Canvas R3F dans layout | `src/app/layout.tsx` | 2h |
| 1.4 | Creer le SceneContainer de base | `SceneContainer.tsx` | 3h |
| 1.5 | Configuration des deux mondes | `worlds.ts` | 2h |
| 1.6 | Stores Zustand pour 3D | `*3d-*-store.ts` | 2h |
| 1.7 | Ecran de chargement 3D | `LoadingScreen.tsx` | 2h |

**Livraison:** Canvas 3D fonctionnel avec un cube de test

### Phase 2: Personnage + Controle (Semaine 3-4)

**Objectifs:** Personnage contrôlable avec animation

#### Taches

| # | Tache | Fichiers | Estimation |
|---|-------|----------|------------|
| 2.1 | Integrer ecctrl | `CharacterController.tsx` | 4h |
| 2.2 | Hook d'inputs clavier | `useCharacterInputs.ts` | 2h |
| 2.3 | Camera follow third-person | `FollowCamera.tsx` | 3h |
| 2.4 | Obtenir/creer model personnage | `public/3d/characters/` | 4h |
| 2.5 | Systeme d'animations | `AnimationMixer.tsx` | 4h |
| 2.6 | Physique Rapier + Collisions | `PhysicsWorld.tsx` | 3h |

**Sources:**
- [ecctrl Repository](https://github.com/pmndrs/ecctrl)
- [Third Person Controller Tutorial](https://wawasensei.dev/tuto/third-person-controller-react-three-fiber-tutorial)

**Livraison:** Personnage contrôlable (WASD) avec animations idle/walk/run

### Phase 3: Les Deux Mondes (Semaine 5-7)

**Objectifs:** Creation des environnements Dev et Art

#### Taches

| # | Tache | Fichiers | Estimation |
|---|-------|----------|------------|
| 3.1 | Lighting configuration Dev | `DevWorldObjects.tsx` | 3h |
| 3.2 | Lighting configuration Art | `ArtWorldObjects.tsx` | 3h |
| 3.3 | Modeles decor Dev world | `public/3d/models/dev/` | 8h |
| 3.4 | Modeles decor Art world | `public/3d/models/art/` | 8h |
| 3.5 | Transition entre mondes | `WorldManager.tsx` | 4h |
| 3.6 | World switch UI | `WorldSwitch.tsx` | 2h |
| 3.7 | Audio ambiant par monde | `3d-audio-store.ts` | 3h |

**Sources 3D:**
- **Sketchfab** - Models gratuits/paid
- **Poly Pizza** - Low poly assets
- **Mixamo** - Animations personnage
- **HDRIs** - Poly Haven (gratuit)

**Livraison:** Deux mondes distincts avec bouton de transition

### Phase 4: Interactions + Navigation (Semaine 8)

**Objectifs:** Connecter le monde 3D aux pages du site

#### Taches

| # | Tache | Fichiers | Estimation |
|---|-------|----------|------------|
| 4.1 | Systeme de proximity | `ProximityDetector.ts` | 3h |
| 4.2 | Zones d'interaction | `InteractionZone.tsx` | 2h |
| 4.3 | UI flottante complete | `FloatingUI.tsx` | 4h |
| 4.4 | Navigation Menu | `NavigationMenu.tsx` | 3h |
| 4.5 | Interaction Prompt | `InteractionPrompt.tsx` | 2h |
| 4.6 | Routage 3D -> Pages | liens Next.js | 2h |

**Livraison:** Navigation complète entre 3D et pages portfolio/blog

### Phase 5: Content + Polish (Semaine 9-10)

**Objectifs:** Contenu final, optimisations, bugfixes

#### Taches

| # | Tache | Fichiers | Estimation |
|---|-------|----------|------------|
| 5.1 | Modeles 3D finaux | `public/3d/` | 8h |
| 5.2 | Postprocessing effects | `SceneContainer.tsx` | 4h |
| 5.3 | Optimisation performance | loading, LOD | 4h |
| 5.4 | Accessibilite 3D | reduced motion, focus | 3h |
| 5.5 | Tests cross-browser | Chrome, Firefox, Safari | 4h |
| 5.6 | Bugfixes + refinement | divers | 6h |

**Livraison:** Portfolio 3D immersif complet et optimise

---

## Code Examples

### Layout avec Canvas 3D

```typescript
// src/app/layout.tsx - Modifie pour 3D
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/config/site"
import { Providers } from "@/components/providers"
import { SceneContainer } from "@/core/3d/scenes/SceneContainer"
import { FloatingUI } from "@/components/3d/FloatingUI"
import { WorldProvider } from "@/components/3d/WorldProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // ... reste metadata
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <WorldProvider>
            {/* 3D Scene - Always rendered */}
            <SceneContainer />

            {/* Floating UI - Overlays the 3D scene */}
            <FloatingUI />

            {/* Page Content - Rendered on top when navigating */}
            <main className="relative z-10">
              {children}
            </main>
          </WorldProvider>
        </Providers>
      </body>
    </html>
  )
}
```

### World Provider

```typescript
// src/components/3d/WorldProvider.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { WorldType } from '@/core/3d/scenes/types';

interface WorldContextValue {
  currentWorld: WorldType;
  switchWorld: (world: WorldType) => void;
}

const WorldContext = createContext<WorldContextValue | undefined>(undefined);

export function WorldProvider({ children }: { children: ReactNode }) {
  const [currentWorld, setCurrentWorld] = useState<WorldType>('dev');

  const switchWorld = (world: WorldType) => {
    setCurrentWorld(world);
  };

  return (
    <WorldContext.Provider value={{ currentWorld, switchWorld }}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorld must be used within WorldProvider');
  }
  return context;
}
```

### Proximity Detection Hook

```typescript
// src/hooks/useProximity.ts
'use client';

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useCharacterStore } from '@/store/3d-character-store';

interface ProximityObject {
  id: string;
  position: [number, number, number];
  radius: number;
  data: {
    name: string;
    route: string;
  };
}

export function useProximity(objects: ProximityObject[]) {
  const checkInterval = useRef<number>();
  const { setCanInteract, position } = useCharacterStore();

  useEffect(() => {
    checkInterval.current = window.setInterval(() => {
      const charPosition = new Vector3(...position);

      for (const obj of objects) {
        const objPosition = new Vector3(...obj.position);
        const distance = charPosition.distanceTo(objPosition);

        if (distance < obj.radius) {
          setCanInteract(true, obj.data);
          return;
        }
      }

      setCanInteract(false);
    }, 100); // Check 10 times per second

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [objects, position, setCanInteract]);
}
```

### Loading Screen avec Progress

```typescript
// src/components/3d/LoadingScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen() {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          <h1 className="mb-8 text-4xl font-bold tracking-tighter">
            OALACEA
          </h1>

          <div className="w-64">
            <div className="mb-2 flex justify-between text-sm text-white/60">
              <span>Loading world</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-white/40">
            Use WASD to explore
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Post-Processing Configuration

```typescript
// src/core/3d/postprocessing/PostProcessing.tsx
'use client';

import { EffectComposer, Bloom, Vignette, ColorDepth } from '@react-three/postprocessing';
import { useWorldStore } from '@/store/3d-world-store';

export function PostProcessing() {
  const { currentWorld } = useWorldStore();

  return (
    <EffectComposer>
      {/* Bloom for neon lights effect */}
      <Bloom
        luminanceThreshold={currentWorld === 'dev' ? 0.2 : 0.4}
        luminanceSmoothing={0.9}
        intensity={currentWorld === 'dev' ? 0.5 : 1.2}
        mipmapBlur
      />

      {/* Vignette for focus */}
      <Vignette
        offset={0.3}
        darkness={currentWorld === 'dev' ? 0.8 : 0.5}
      />

      {/* Slight color depth for cinematic feel */}
      <ColorDepth
        bits={currentWorld === 'dev' ? 16 : 32}
      />
    </EffectComposer>
  );
}
```

---

## Performance Considerations

### Asset Optimization

1. **GLTF Compression**
   ```bash
   # Install gltfpack
   npm install -g @gltf-transform/cli

   # Compress models
   gltfpack -i model.glb -o model-compressed.glb -tc -i
   ```

2. **Texture Optimization**
   - Use JPEG compression (quality 80-85) for textures without alpha
   - Use PNG for textures requiring transparency
   - Create texture atlases when possible

3. **Level of Detail (LOD)**
   ```typescript
   import { LOD } from '@react-three/drei';

   <LOD distances={[0, 10, 20]}>
     <mesh geometry={highPoly} />
     <mesh geometry={mediumPoly} />
     <mesh geometry={lowPoly} />
   </LOD>
   ```

### Loading Strategy

```typescript
// Lazy load worlds
const DevWorldObjects = lazy(() =>
  import('@/core/3d/scenes/worlds/DevWorldObjects')
);
const ArtWorldObjects = lazy(() =>
  import('@/core/3d/scenes/worlds/ArtWorldObjects')
);

// Use Suspense for streaming
<Suspense fallback={<LoadingScreen />}>
  {currentWorld === 'dev' ? <DevWorldObjects /> : <ArtWorldObjects />}
</Suspense>
```

---

## Accessibility

### Reduced Motion Support

```typescript
// src/hooks/useReducedMotion.ts
'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

### Keyboard Navigation

Ensure all interactive elements in the 3D scene are also accessible via traditional keyboard navigation (Tab, Enter, Escape).

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Black screen | Check Three.js version compatibility with R3F |
| Character falls through floor | Verify Rapier physics world setup |
| Animations not playing | Ensure animation names match GLB file |
| Poor performance | Check draw calls, reduce polygon count |
| CORS errors with assets | Serve assets from public/ folder, not external |

---

## Sources et References

### Libraries
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
- [ecctrl](https://github.com/pmndrs/ecctrl)

### Tutorials
- [Third Person Controller R3F Tutorial](https://wawasensei.dev/tuto/third-person-controller-react-three-fiber-tutorial)
- [Physics-Based Character Controller with AI](https://tympanus.net/codrops/2025/05/28/building-a-physics-based-character-controller-with-the-help-of-ai/)
- [R3F & Rapier Third Person](https://discourse.threejs.org/t/r3f-rapier-third-person-controller-and-follow-camera/48832)

### Inspiration
- [Bruno Simon Portfolio](https://bruno-simon.com/) - Original inspiration
- [Poimandres](https://pmnd.rs/) - R3F ecosystem maintainers

---

**Document Status:** Complete
**Next Steps:** Begin Phase 1 - Fondation Technique

**Pour questions ou suggestions:** Refer to the GitHub repository or create an issue.
