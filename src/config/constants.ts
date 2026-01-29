/**
 * Application-wide constants
 * Centralized magic numbers and configuration values
 */

// =========================================
// RATE LIMITING
// =========================================
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 60 * 1000, // 1 hour in milliseconds
  MAX_COMMENTS_PER_WINDOW: 5,
  MAX_LOGIN_ATTEMPTS: 5,
} as const;

// =========================================
// TIME CONVERSIONS
// =========================================
export const TIME = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// =========================================
// THREE.JS CONFIGURATION
// =========================================
export const THREE_JS = {
  PIXEL_RATIO: {
    LOW: 1,
    MEDIUM: 1.5,
    HIGH: 2,
  },
  SHADOW_MAP: {
    BASIC: 0,
    PCF: 1,
    PCF_SOFT: 2,
  },
  DEFAULT_CAMERA_FOV: 75,
  DEFAULT_NEAR_PLANE: 0.1,
  DEFAULT_FAR_PLANE: 1000,
} as const;

// =========================================
// 3D OCCLUSION
// =========================================
export const OCCLUSION = {
  DEFAULT_CHECK_INTERVAL: 3, // Frames between checks
  CHARACTER_HEIGHT_OFFSET: 1,
  MIN_DISTANCE_THRESHOLD: 0.5,
  OPACITY_CHANGE_RATE: 0.05,
} as const;

// =========================================
// MULTIPLAYER
// =========================================
export const MULTIPLAYER = {
  POSITION_BROADCAST_INTERVAL: 1000, // ms
  CONNECTION_TIMEOUT: 30000, // ms
  RECONNECT_DELAY: 3000, // ms
  PUSHER_DEFAULT_PORT: 3001,
} as const;

// =========================================
// INTERACTION PARTICLES
// =========================================
export const PARTICLES = {
  DEFAULT_COUNT: 12,
  HOVER_COUNT: 16,
  LIFETIME: 1000, // ms
} as const;

// =========================================
// CACHE DURATIONS (in seconds)
// =========================================
export const CACHE_DURATION = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 120,
  VERY_LONG: 300,
} as const;

// =========================================
// PAGINATION
// =========================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
