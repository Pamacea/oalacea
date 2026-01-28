# Oalacea 3D - Roadmap d'Implementation

> Guide détaillé de l'implémentation du portfolio 3D immersif

**Version:** 1.0.0
**Last Updated:** 2026-01-24
**Status:** Ready to Start

---

## Overview

Ce document détaille la roadmap d'implémentation du portfolio 3D Oalacea, inspiré de Bruno Simon, avec deux mondes explorables et un personnage contrôlable.

### Vision Résumée

```
┌─────────────────────────────────────────────────────────────┐
│                    OALACEA 3D PORTFOLIO                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐         ┌──────────────┐               │
│   │  MONDE DEV   │         │  MONDE ART   │               │
│   │              │   <->   │              │               │
│   │  Warhammer   │         │  Underground │               │
│   │  40k Style   │         │  Gothic Art  │               │
│   └──────────────┘         └──────────────┘               │
│          │                         │                       │
│          └─────────────┬───────────┘                       │
│                        │                                    │
│                   ┌────▼─────┐                             │
│                   │  PERSO   │                             │
│                   │ 3D Hero  │                             │
│                   └──────────┘                             │
│                        │                                    │
│                   ┌────▼─────┐                             │
│                   │ UI Float  │                             │
│                   │ Navigation│                             │
│                   └──────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Prérequis

### Connaissances Requises

- React 19 et Next.js 16
- Three.js concepts de base
- TypeScript
- Zustand pour le state management

### Outils Nécessaires

- Blender ou logiciel de modélisation 3D
- éditeur de code (VS Code recommandé)
- Navigateur moderne (Chrome/Firefox)

### Avant de Commencer

1. Lire le document d'architecture complet : `docs/3d-architecture.md`
2. Installer les dépendances : voir `docs/3d-dependencies.md`
3. Comprendre la structure du projet existant

---

## Phase 1: Fondation Technique (Semaine 1-2)

### Objectifs

Mise en place de l'infrastructure 3D de base avec un Canvas R3F fonctionnel.

### Tâches

#### 1.1 Installation des Dépendances

**Commande:**
```bash
pnpm add @react-three/fiber @react-three/drei three
pnpm add -D @types/three
```

**Vérification:**
```bash
# Vérifier que Three.js est installé
grep -E "@react-three|three" package.json
```

#### 1.2 Création de la Structure de Dossiers

**À créer:**
```
src/
├── core/
│   └── 3d/
│       ├── scenes/
│       ├── character/
│       ├── camera/
│       ├── physics/
│       └── interactions/
├── config/
│   └── 3d/
└── hooks/
    └── useCharacterInputs.ts
```

**Action:**
```bash
# Créer les dossiers
mkdir -p src/core/3d/{scenes,character,camera,physics,interactions}
mkdir -p src/config/3d
mkdir -p public/3d/{characters,models,env,audio}
```

#### 1.3 Configuration du Canvas R3F dans le Layout

**Fichier:** `src/app/page.tsx`

```typescript
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen">
      {/* 3D Canvas */}
      <div className="absolute inset-0 -z-10">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 2, 5]} />
          <OrbitControls />

          {/* Test: Un cube simple */}
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>

          {/* Lighting de base */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />
        </Canvas>
      </div>

      {/* UI Overlay - Coming soon */}
      <div className="relative z-10 p-6">
        <h1 className="text-4xl font-bold">OALACEA 3D</h1>
        <p className="text-muted-foreground">Portfolio immersif en construction...</p>
      </div>
    </main>
  );
}
```

**Test:** Ouvrir `http://localhost:3000` - Un cube rose doit être visible.

#### 1.4 Création du SceneContainer de Base

**Fichier:** `src/core/3d/scenes/SceneContainer.tsx`

```typescript
'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Preload } from '@react-three/drei';
import { Suspense } from 'react';

interface SceneContainerProps {
  children: React.ReactNode;
}

function SceneContent({ children }: SceneContainerProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />
      <Environment preset="night" />
      {children}
      <Preload all />
    </>
  );
}

export function SceneContainer({ children }: SceneContainerProps) {
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
        <Suspense fallback={null}>
          <SceneContent>{children}</SceneContent>
        </Suspense>
      </Canvas>
    </div>
  );
}
```

#### 1.5 Configuration des Deux Mondes

**Déjà créé:** `src/config/3d/worlds.ts`

Contient les configurations DEV_WORLD et ART_WORLD avec :
- Couleurs
- Lighting
- Objets interactifs
- Points d'apparition

#### 1.6 Stores Zustand pour le 3D

**Déjà créés:**
- `src/store/3d-character-store.ts`
- `src/store/3d-world-store.ts`
- `src/store/3d-audio-store.ts`

#### 1.7 Ecran de Chargement 3D

**Fichier:** `src/components/3d/LoadingScreen.tsx`

```typescript
'use client';

import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen() {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setVisible(false), 500);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          <h1 className="mb-8 text-4xl font-bold">OALACEA</h1>
          <div className="w-64">
            <div className="mb-2 flex justify-between text-sm">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Livrable Phase 1

- [ ] Canvas 3D fonctionnel
- [ ] Cube de test visible
- [ ] Structure de dossiers créée
- [ ] Stores configurés
- [ ] Écran de chargement fonctionnel

---

## Phase 2: Personnage + Contrôle (Semaine 3-4)

### Objectifs

Personnage contrôlable avec animations et caméra follow.

### Tâches

#### 2.1 Intégration de ecctrl

**Installation:**
```bash
pnpm add @react-three/rapier ecctrl
```

**Fichier:** `src/core/3d/character/CharacterController.tsx`

```typescript
'use client';

import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { EcctrlAnimation } from 'ecctrl';

const keyboardMap: KeyboardControlsEntry[] = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW', 'KeyZ'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA', 'KeyQ'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'action1', keys: ['KeyE'] },
];

export function CharacterController() {
  return (
    <KeyboardControls map={keyboardMap}>
      {/* Ecctrl sera configuré ici */}
      <EcctrlAnimation
        characterURL="/3d/characters/hero.glb"
        animationSet={{
          idle: 'Idle',
          walk: 'Walk',
          run: 'Run',
          jump: 'Jump',
          fall: 'Fall',
          action1: 'Wave',
        }}
      />
    </KeyboardControls>
  );
}
```

**Sources:**
- [ecctrl Repository](https://github.com/pmndrs/ecctrl)
- [Third Person Controller Tutorial](https://wawasensei.dev/tuto/third-person-controller-react-three-fiber-tutorial)

#### 2.2 Hook d'Inputs Clavier

**Déjà documenté** dans `docs/3d-architecture.md`

#### 2.3 Camera Follow Third-Person

**Fichier:** `src/core/3d/camera/FollowCamera.tsx`

Utiliser `<CameraControls />` de @react-three/drei ou implémenter une caméra follow personnalisée.

#### 2.4 Obtenir/Créer le Modèle Personnage

**Options:**

1. **Mixamo** (Gratuit) - [mixamo.com](https://www.mixamo.com)
   - Personnages préfabriqués
   - Animations incluses
   - Export GLB ready

2. **Ready Player Me** (Gratuit) - [readyplayer.me](https://readyplayer.me)
   - Avatars personnalisables
   - Export GLB

3. **Sketchfab** (Gratuit/Paid)
   - Large catalogue
   - Vérifier la licence

4. **Création personnalisée** dans Blender

**Format requis:**
- GLB (binaire glTF)
- Animations incluses dans le fichier
- Rig complet avec bones

#### 2.5 Système d'Animations

**Fichier:** `src/core/3d/character/animations/AnimationMixer.tsx`

```typescript
'use client';

import { useActions, useFetch } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { AnimationAction, AnimationMixer } from 'three';

export function useAnimationMixer(gltf: any) {
  const { actions, names } = useActions(gltf.animations);
  const mixer = useRef<AnimationMixer>();
  const currentAction = useRef<AnimationAction>();

  const playAnimation = (name: string) => {
    if (currentAction.current?.isRunning()) {
      currentAction.current.fadeOut(0.2);
    }

    const action = actions[name];
    if (action) {
      action.reset().fadeIn(0.2).play();
      currentAction.current = action;
    }
  };

  return { playAnimation, availableAnimations: names };
}
```

#### 2.6 Physique Rapier + Collisions

**Fichier:** `src/core/3d/physics/PhysicsWorld.tsx`

```typescript
'use client';

import { Physics, RigidBody } from '@react-three/rapier';

export function PhysicsWorld({ children }: { children: React.ReactNode }) {
  return (
    <Physics debug={false} gravity={[0, -9.81, 0]}>
      {/* Sol */}
      <RigidBody type="fixed" colliders="hull" position={[0, -0.5, 0]}>
        <mesh>
          <boxGeometry args={[50, 1, 50]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </RigidBody>

      {children}
    </Physics>
  );
}
```

### Livrable Phase 2

- [ ] Personnage visible dans la scène
- [ ] Contrôles WASD/ZQSD fonctionnels
- [ ] Animations idle/walk/run/jump
- [ ] Camera follow qui fonctionne
- [ ] Collisions avec le sol

---

## Phase 3: Les Deux Mondes (Semaine 5-7)

### Objectifs

Création des environnements Dev et Art distincts.

### Tâches

#### 3.1 Lighting Configuration Dev World

**Palette:**
- Noir profond (`#0a0a0a`)
- Or antique (`#d4af37`)
- Rouge sombre (`#8b0000`)

**Éléments:**
- Lumières ponctuelles dorées
- Atmosphère dramatique
- Brouillard dense

#### 3.2 Lighting Configuration Art World

**Palette:**
- Bleu nuit (`#1a1a2e`)
- Rouge néon (`#ff6b6b`)
- Turquoise (`#4ecdc4`)

**Éléments:**
- Néons colorés
- Spots museum
- Ambiance underground

#### 3.3 Modèles Décor Dev World

**Assets nécessaires:**
- `monolith.glb` - Objet interactif principal
- `terminal.glb` - Pour accéder au blog
- `server-rack.glb` - Décor
- `data-stream.glb` - Effet visuel

#### 3.4 Modèles Décor Art World

**Assets nécessaires:**
- `gallery-frame.glb` - Cadre pour portfolio
- `graffiti-wall.glb` - Mur interactif
- `pedestal.glb` - Socle exposition
- `neon-sign.glb` - Décor lumineux

#### 3.5 Transition Entre Mondes

**Effets:**
- Fade avec overlay coloré
- Téléportation du personnage
- Crossfade audio
- Transition smooth (~2 secondes)

#### 3.6 World Switch UI

**Composant:** `src/components/3d/WorldSwitch.tsx`

Bouton pour changer de monde avec feedback visuel.

#### 3.7 Audio Ambiant par Monde

**Dev World:**
- Sons mécaniques légers
- Ambiance industrielle
- Chorals sombres optionnels

**Art World:**
- Beats hip-hop
- Ambiance street
- Sons urbains

### Livrable Phase 3

- [ ] Deux environnements visuellement distincts
- [ ] Bouton de transition fonctionnel
- [ ] Audio adapté par monde
- [ ] Objets interactifs visibles

---

## Phase 4: Interactions + Navigation (Semaine 8)

### Objectifs

Connecter le monde 3D aux pages du site.

### Tâches

#### 4.1 Système de Proximité

**Hook:** `src/hooks/useProximity.ts`

Détecte quand le personnage est proche d'un objet interactif.

#### 4.2 Zones d'Interaction

**Composant:** `src/core/3d/interactions/InteractionZone.tsx`

Zones invisibles qui déclenchent des interactions.

#### 4.3 UI Flottante Complète

**Composant:** `src/components/3d/FloatingUI.tsx`

- Header avec logo
- Switch world
- Menu navigation
- Help controls
- Interaction prompts

#### 4.4 Navigation Menu

**Composant:** `src/components/3d/NavigationMenu.tsx`

Menu sidebar avec liens vers:
- Portfolio Dev
- Portfolio Art
- Blog
- About
- Contact

#### 4.5 Interaction Prompt

**Composant:** `src/components/3d/InteractionPrompt.tsx`

Affiche "Press E to view" quand près d'un objet interactif.

#### 4.6 Routage 3D vers Pages

**Approche:**
- Navigation Next.js standard
- Le 3D reste en arrière-plan
- Transition smooth entre 3D et pages classiques

### Livrable Phase 4

- [ ] Détection de proximité fonctionnelle
- [ ] Prompts d'interaction visibles
- [ ] Navigation complète
- [ ] Liens fonctionnels vers toutes les pages

---

## Phase 5: Content + Polish (Semaine 9-10)

### Objectifs

Contenu final, optimisations, bugfixes.

### Tâches

#### 5.1 Modèles 3D Finaux

- Optimiser les polycounts
- Compresser les textures
- Créer LODs si nécessaire

#### 5.2 Post-Processing Effects

**Fichier:** `src/core/3d/postprocessing/PostProcessing.tsx`

- Bloom pour néons
- Vignette pour focus
- Color grading

#### 5.3 Optimisation Performance

- Lazy loading des mondes
- Instancing pour objets répétitifs
- Texture compression (gltfpack)

#### 5.4 Accessibilité 3D

- Respect prefers-reduced-motion
- Navigation clavier complète
- Focus indicators

#### 5.5 Tests Cross-Browser

- Chrome (principal)
- Firefox
- Safari ( attention à WebGL)

#### 5.6 Bugfixes + Refinement

- QA complet
- Correction des bugs identifiés
- Polish final

### Livrable Phase 5

- [ ] Site complet fonctionnel
- [ ] Performance optimale (60fps)
- [ ] Accessibilité validée
- [ ] Cross-browser compatible

---

## Checklists

### Phase 1: Foundation
- [ ] Dépendances installées
- [ ] Structure créée
- [ ] Canvas R3F fonctionnel
- [ ] Test cube visible
- [ ] Stores configurés
- [ ] Loading screen

### Phase 2: Character
- [ ] Personnage importé
- [ ] Contrôles WASD
- [ ] Animations (idle, walk, run)
- [ ] Camera follow
- [ ] Collisions actives
- [ ] Saut fonctionnel

### Phase 3: Worlds
- [ ] Dev world lighting
- [ ] Art world lighting
- [ ] Models Dev importés
- [ ] Models Art importés
- [ ] Transition fonctionne
- [ ] World switch UI
- [ ] Audio par monde

### Phase 4: Interactions
- [ ] Proximity detection
- [ ] Interaction zones
- [ ] Floating UI
- [ ] Navigation menu
- [ ] Interaction prompts
- [ ] Routing 3D -> pages

### Phase 5: Polish
- [ ] Final models
- [ ] Post-processing
- [ ] Performance optimisée
- [ ] Accessibilité
- [ ] Cross-browser testé
- [ ] Bugfree

---

## Ressources

### Documentation
- `docs/3d-architecture.md` - Architecture complète
- `docs/3d-dependencies.md` - Guide des dépendances
- `src/config/3d/worlds.ts` - Configuration des mondes
- `src/core/3d/scenes/types.ts` - Types TypeScript

### Sources Externes
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [Rapier Physics](https://github.com/pmndrs/react-three-rapier)
- [ecctrl](https://github.com/pmndrs/ecctrl)

### Inspiration
- [Bruno Simon Portfolio](https://bruno-simon.com/)
- [Poimandres](https://pmnd.rs/)

---

## Notes

### Performance Targets
- 60 FPS constant
- < 3s de chargement initial
- < 500ms de transition entre mondes

### Assets 3D
- Polycount par modèle: < 50k
- Textures: max 1024x1024
- Formats: GLB (draco compressé)

### Browser Support
- Chrome 120+
- Firefox 120+
- Safari 17+
- WebGL 2 requis

---

**Document Status:** Complete
**Next Step:** Begin Phase 1.1 - Install Dependencies
