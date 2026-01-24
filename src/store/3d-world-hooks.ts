// World store hooks
import { useWorldStore } from './3d-world-store';

export const useSwitchWorld = () => {
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const isTransitioning = useWorldStore((s) => s.isTransitioning);
  return { switchWorld, isTransitioning };
};

export const useLoadingProgress = () => {
  const progress = useWorldStore((s) => s.loadingProgress);
  const isComplete = useWorldStore((s) => s.isInitialLoadComplete);
  return { progress, isComplete, isLoading: !isComplete || progress < 100 };
};
