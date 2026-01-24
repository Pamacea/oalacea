// src/core/3d/scenes/types.ts
// Types pour le système 3D du portfolio Oalacea

// ============================================================================
// WORLD TYPES
// ============================================================================

/**
 * Les deux mondes disponibles dans le portfolio
 */
export type WorldType = 'dev' | 'art';

/**
 * Configuration complète d'un monde 3D
 */
export interface WorldConfig {
  /** Identifiant unique du monde */
  id: WorldType;
  /** Nom d'affichage du monde */
  name: string;
  /** Palette de couleurs du monde */
  colors: WorldColors;
  /** Configuration de l'éclairage */
  lighting: WorldLighting;
  /** Environnement et objets */
  environment: WorldEnvironment;
  /** Point d'apparition du personnage [x, y, z] */
  spawnPoint: [number, number, number];
}

/**
 * Palette de couleurs d'un monde
 */
export interface WorldColors {
  /** Couleur du fond (format hex) */
  background: string;
  /** Lumière ambiante (format hex) */
  ambient: string;
  /** Couleur du brouillard (format hex) */
  fog: string;
  /** Couleur primaire (accents, UI) */
  primary: string;
  /** Couleur secondaire */
  secondary: string;
}

/**
 * Configuration de l'éclairage d'un monde
 */
export interface WorldLighting {
  /** Intensité de la lumière ambiante (0-1) */
  ambientIntensity: number;
  /** Intensité de la lumière directionnelle (0-2) */
  directionalIntensity: number;
  /** Lumières ponctuelles du monde */
  pointLights: PointLightConfig[];
}

/**
 * Configuration d'une lumière ponctuelle
 */
export interface PointLightConfig {
  /** Position [x, y, z] */
  position: [number, number, number];
  /** Couleur de la lumière (format hex) */
  color: string;
  /** Intensité (0-10+) */
  intensity: number;
  /** Décroissance de la lumière (0-3) */
  decay: number;
}

/**
 * Environnement et objets du monde
 */
export interface WorldEnvironment {
  /** Chemin vers le HDRI pour l'éclairage global */
  skybox: string;
  /** Chemin vers le modèle de sol */
  ground: string;
  /** Objets interactifs et décor dans le monde */
  objects: WorldObject[];
}

/**
 * Objet 3D dans un monde
 */
export interface WorldObject {
  /** Identifiant unique de l'objet */
  id: string;
  /** Type de l'objet */
  type: 'glb' | 'primitive' | 'text';
  /** Position [x, y, z] */
  position: [number, number, number];
  /** Rotation [x, y, z] en radians */
  rotation?: [number, number, number];
  /** Échelle [x, y, z] */
  scale?: [number, number, number];
  /** Chemin vers le modèle GLB (si type='glb') */
  model?: string;
  /** L'objet est-il interactif ? */
  interactable?: boolean;
  /** Route vers laquelle naviguer lors de l'interaction */
  onClick?: string;
  /** Distance d'interaction en unités world */
  interactionDistance?: number;
  /** Nom affiché lors de l'interaction */
  displayName?: string;
}

// ============================================================================
// CHARACTER TYPES
// ============================================================================

/**
 * État des inputs du personnage
 */
export interface CharacterInputs {
  /** Mouvement avant (W/Z) */
  forward: boolean;
  /** Mouvement arrière (S) */
  backward: boolean;
  /** Mouvement gauche (A/Q) */
  left: boolean;
  /** Mouvement droite (D) */
  right: boolean;
  /** Mode course (Shift) */
  run: boolean;
  /** Saut (Espace) */
  jump: boolean;
  /** Interaction (E) */
  interact: boolean;
}

/**
 * État du personnage
 */
export interface CharacterState {
  /** Position actuelle [x, y, z] */
  position: [number, number, number];
  /** Rotation Y en radians */
  rotation: number;
  /** Vélocité [x, y, z] */
  velocity: [number, number, number];
  /** Le personnage est-il au sol ? */
  isGrounded: boolean;
  /** Animation actuelle */
  currentAnimation: AnimationType;
}

/**
 * Animations disponibles pour le personnage
 */
export type AnimationType =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'interact';

/**
 * Configuration du personnage
 */
export interface CharacterConfig {
  /** Vitesse de marche (unités/seconde) */
  walkSpeed: number;
  /** Vitesse de course (unités/seconde) */
  runSpeed: number;
  /** Force du saut */
  jumpForce: number;
  /** Vitesse de rotation (radians/seconde) */
  rotationSpeed: number;
  /** Hauteur du personnage */
  height: number;
  /** Masse du personnage (pour la physique) */
  mass: number;
  /** Chemin vers le modèle GLB du personnage */
  modelPath: string;
  /** Mapping des animations */
  animations: CharacterAnimations;
}

/**
 * Mapping des noms d'animations
 */
export interface CharacterAnimations {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  fall: string;
  land: string;
  interact: string;
}

// ============================================================================
// CAMERA TYPES
// ============================================================================

/**
 * Configuration de la caméra follow
 */
export interface CameraConfig {
  /** Offset par rapport au personnage [x, y, z] */
  offset: [number, number, number];
  /** Point visé relatif au personnage [x, y, z] */
  lookAtOffset: [number, number, number];
  /** Facteur de lissage (0-1, plus bas = plus fluide) */
  smoothFactor: number;
  /** FOV de la caméra en degrés */
  fov: number;
  /** Distance minimale du personnage */
  minDistance: number;
  /** Distance maximale du personnage */
  maxDistance: number;
}

/**
 * Mode de la caméra
 */
export type CameraMode = 'follow' | 'orbit' | 'cinematic' | 'firstPerson';

/**
 * État de la caméra
 */
export interface CameraState {
  mode: CameraMode;
  position: [number, number, number];
  target: [number, number, number];
  isTransitioning: boolean;
}

// ============================================================================
// INTERACTION TYPES
// ============================================================================

/**
 * Cible d'interaction détectée
 */
export interface InteractionTarget {
  /** ID de l'objet */
  objectId: string;
  /** Nom à afficher */
  name: string;
  /** Route de navigation */
  route: string;
  /** Distance actuelle du personnage */
  distance: number;
}

/**
 * Zone d'interaction
 */
export interface InteractionZone {
  /** Position de la zone [x, y, z] */
  position: [number, number, number];
  /** Rayon de la zone */
  radius: number;
  /** Données de l'interaction */
  data: {
    name: string;
    route: string;
  };
}

// ============================================================================
// TRANSITION TYPES
// ============================================================================

/**
 * Type de transition entre mondes
 */
export type TransitionType = 'fade' | 'warp' | 'portal' | 'cinematic';

/**
 * Configuration d'une transition
 */
export interface WorldTransition {
  type: TransitionType;
  color?: string;
  duration: number;
}

/**
 * État d'une transition en cours
 */
export interface TransitionState {
  isActive: boolean;
  progress: number; // 0-1
  fromWorld: WorldType;
  toWorld: WorldType;
}

// ============================================================================
// AUDIO TYPES
// ============================================================================

/**
 * Configuration audio d'un monde
 */
export interface WorldAudioConfig {
  /** Pistes audio à jouer */
  tracks: AudioTrack[];
  /** Volume principal (0-1) */
  masterVolume: number;
  /** Crossfade duration entre mondes (ms) */
  crossfadeDuration: number;
}

/**
 * Piste audio
 */
export interface AudioTrack {
  /** Chemin vers le fichier audio */
  path: string;
  /** Type de piste */
  type: 'ambient' | 'music' | 'sfx' | 'footstep';
  /** Volume de la piste (0-1) */
  volume: number;
  /** La piste doit-elle boucler ? */
  loop: boolean;
}

// ============================================================================
// PHYSICS TYPES
// ============================================================================

/**
 * Configuration du monde physique
 */
export interface PhysicsConfig {
  /** Gravité [x, y, z] */
  gravity: [number, number, number];
  /** Pas de simulation (fixed timestep) */
  timestep: number;
  /** Nombre d'itérations de résolution */
  iterations: number;
}

/**
 * Material pour la physique
 */
export interface PhysicsMaterial {
  name: string;
  friction: number;
  restitution: number; // Bounciness
}

// ============================================================================
// LOADING TYPES
// ============================================================================

/**
 * État de chargement des assets 3D
 */
export interface LoadingState {
  /** Progression globale (0-100) */
  progress: number;
  /** Assets en cours de chargement */
  loading: Set<string>;
  /** Assets chargés avec succès */
  loaded: Set<string>;
  /** Assets en erreur */
  errors: Map<string, Error>;
}

/**
 * Asset à charger
 */
export interface AssetDescriptor {
  /** Identifiant unique */
  id: string;
  /** Type d'asset */
  type: 'gltf' | 'texture' | 'hdr' | 'audio';
  /** Chemin vers l'asset */
  path: string;
  /** L'asset est-il critique pour le démarrage ? */
  critical: boolean;
}
