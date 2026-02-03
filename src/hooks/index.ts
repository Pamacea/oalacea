// Re-export hooks from features and shared for backward compatibility

// Auth
export { useAuth, usePermissions, useContentLock } from '@/features/auth';

// Blog - query hooks migrated to queries/ folder
export { usePosts, usePost } from '@/features/blog/queries';
export { usePostsClient, useBlogDocuments } from '@/features/blog/hooks';

// Portfolio
export { useProjects, useProject } from '@/features/portfolio/hooks';

// 3D World
export {
  useHapticFeedback,
  useJoystickActive,
  setJoystickActive,
  useKeyboardNavigation,
  useKeyboardNavItem,
  useProximity,
  usePhysicsEngine,
  useWorldStateSync,
  getCurrentWorldState,
} from '@/features/3d-world';

// Onboarding
export { useFirstVisit } from '@/features/onboarding';

// AI Chat - feature removed
// export { useAIChat } from '@/features/ai-chat';

// Shared hooks
export {
  useMediaQuery,
  useDebounce,
  useFormState,
  useLocalStorage,
  useMobileDetection,
  useKeyboardShortcuts,
  useReducedMotion,
  useScreenReader,
  useWebSpeech,
} from '@/shared/hooks';

// Backward compatibility - useIsMobile
export { useIsMobile } from './use-mobile';
