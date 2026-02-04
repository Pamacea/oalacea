'use client';

import { useAudioStore } from '@/features/3d-world/store/3d-audio-store';

/**
 * Hook to add SFX to CRUD operations
 * Call these after your CRUD operations complete
 */
export function useCrudSound() {
  const { playNotification, playNotificationDelete, isEnabled } = useAudioStore();

  const playSuccess = () => {
    if (isEnabled) playNotification();
  };

  const playDelete = () => {
    if (isEnabled) playNotificationDelete();
  };

  /**
   * Wrapper for async CRUD operations that plays SFX on completion
   * @param operation - The async operation to execute
   * @param type - 'create' | 'update' | 'delete' | 'view'
   */
  const withSound = async <T>(
    operation: () => Promise<T>,
    type: 'create' | 'update' | 'delete' | 'view' = 'create'
  ): Promise<T> => {
    try {
      const result = await operation();

      if (type === 'delete') {
        playDelete();
      } else if (type === 'create' || type === 'update') {
        playSuccess();
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    playSuccess,
    playDelete,
    withSound,
    canPlay: isEnabled,
  };
}

/**
 * Example usage:
 *
 * ```tsx
 * function MyForm() {
 *   const { withSound } = useCrudSound();
 *
 *   const handleSubmit = async (data: FormData) => {
 *     await withSound(
 *       () => createPost(data),
 *       'create'
 *     );
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
