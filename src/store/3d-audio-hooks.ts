// Audio store hooks
import { useAudioStore } from './3d-audio-store';

export const useMasterVolume = () => {
  const volume = useAudioStore((s) => s.masterVolume);
  const setVolume = useAudioStore((s) => s.setMasterVolume);
  const isEnabled = useAudioStore((s) => s.isEnabled);

  return {
    volume,
    setVolume,
    isEnabled,
    toggle: () => {
      useAudioStore.getState().setEnabled(!isEnabled);
    },
  };
};

export const useInitAudio = () => {
  const isEnabled = useAudioStore((s) => s.isEnabled);
  const currentWorld = useAudioStore((s) => s.currentWorld);

  const init = async () => {
    if (isEnabled) return;
    await useAudioStore.getState().loadWorldTracks(currentWorld);
    useAudioStore.getState().setEnabled(true);
  };

  return {
    isInit: isEnabled,
    init,
  };
};
