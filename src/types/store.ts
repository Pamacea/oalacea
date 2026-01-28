// Store state types

// World store
export interface WorldState {
  currentWorld: 'dev' | 'art';
  isTransitioning: boolean;
  transitionState: {
    isActive: boolean;
    progress: number;
    fromWorld: 'dev' | 'art';
    toWorld: 'dev' | 'art';
  } | null;
  loadingProgress: number;
  loadingState: {
    progress: number;
    loading: Set<string>;
    loaded: Set<string>;
    errors: Map<string, Error>;
  };
  isInitialLoadComplete: boolean;
  performanceMode: boolean;
  fps: number;
  preloadedWorlds: Set<'dev' | 'art'>;
}

// Character store
export interface CharacterState {
  position: [number, number, number];
  rotation: number;
  velocity: [number, number, number];
  currentAnimation: 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'land' | 'interact';
  isGrounded: boolean;
  canInteract: boolean;
  interactTarget: {
    name: string;
    route: string;
    objectId: string;
    type?: 'portal' | 'route' | 'dialogue' | 'pickup' | 'admin';
    targetWorld?: 'dev' | 'art';
  } | null;
  isMoving: boolean;
  isRunning: boolean;
  inputs: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    run: boolean;
    jump: boolean;
    interact: boolean;
  };
}

// Audio store
export interface AudioState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isEnabled: boolean;
  isPaused: boolean;
  isMuted: boolean;
  loadedTracks: Map<string, HTMLAudioElement>;
  footstepPlaying: boolean;
  isFading: boolean;
}

// UI store
export interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  currentTab: string;
  notificationsOpen: boolean;
}
