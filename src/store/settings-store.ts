// Settings store for user preferences
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QualityPreset = 'auto' | 'low' | 'medium' | 'high';
export type Theme = 'dark' | 'light';
export type ParticleQuality = 'low' | 'medium' | 'high';

export interface QualitySettings {
  preset: QualityPreset;
  shadowQuality: number;
  shadowMapType: 'basic' | 'pcf' | 'pcfsoft';
  targetFPS: number;
  antialiasing: boolean;
  bloomEnabled: boolean;
  particleQuality: ParticleQuality;
  renderDistance: number;
}

interface SettingsState {
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  toggleReducedMotion: () => void;
  screenReaderMode: boolean;
  setScreenReaderMode: (enabled: boolean) => void;
  toggleScreenReaderMode: () => void;
  quality: QualityPreset;
  setQuality: (quality: QualityPreset) => void;
  autoQuality: boolean;
  setAutoQuality: (enabled: boolean) => void;
  qualitySettings: QualitySettings;
  updateQualitySettings: (settings: Partial<QualitySettings>) => void;
  detectMobileAndApplyQuality: () => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  keyboardShortcuts: boolean;
  setKeyboardShortcuts: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
  auto: {
    preset: 'auto',
    shadowQuality: 1024,
    shadowMapType: 'pcf',
    targetFPS: 60,
    antialiasing: true,
    bloomEnabled: true,
    particleQuality: 'medium',
    renderDistance: 100,
  },
  low: {
    preset: 'low',
    shadowQuality: 512,
    shadowMapType: 'basic',
    targetFPS: 30,
    antialiasing: false,
    bloomEnabled: false,
    particleQuality: 'low',
    renderDistance: 50,
  },
  medium: {
    preset: 'medium',
    shadowQuality: 1024,
    shadowMapType: 'pcf',
    targetFPS: 60,
    antialiasing: true,
    bloomEnabled: true,
    particleQuality: 'medium',
    renderDistance: 75,
  },
  high: {
    preset: 'high',
    shadowQuality: 2048,
    shadowMapType: 'pcfsoft',
    targetFPS: 60,
    antialiasing: true,
    bloomEnabled: true,
    particleQuality: 'high',
    renderDistance: 100,
  },
};

const DEFAULT_SETTINGS: Omit<SettingsState, 'setReducedMotion' | 'toggleReducedMotion' | 'setScreenReaderMode' | 'toggleScreenReaderMode' | 'setQuality' | 'setAutoQuality' | 'setTheme' | 'setKeyboardShortcuts' | 'setSoundEnabled' | 'resetSettings' | 'updateQualitySettings' | 'detectMobileAndApplyQuality' | 'setIsMobile'> = {
  reducedMotion: false,
  screenReaderMode: false,
  quality: 'auto',
  autoQuality: true,
  qualitySettings: QUALITY_PRESETS.auto,
  isMobile: false,
  theme: 'dark',
  keyboardShortcuts: true,
  soundEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

      setScreenReaderMode: (enabled) => set({ screenReaderMode: enabled }),
      toggleScreenReaderMode: () => set((state) => ({ screenReaderMode: !state.screenReaderMode })),

      setQuality: (quality) => set({ quality, qualitySettings: QUALITY_PRESETS[quality] }),
      setAutoQuality: (enabled) => set({ autoQuality: enabled }),

      updateQualitySettings: (settings) => set((state) => ({
        qualitySettings: { ...state.qualitySettings, ...settings },
      })),

      detectMobileAndApplyQuality: () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );
        set({ isMobile });
        if (isMobile) {
          set({ quality: 'low', qualitySettings: QUALITY_PRESETS.low });
        }
      },

      setIsMobile: (mobile) => set({ isMobile: mobile }),

      setTheme: (theme) => set({ theme }),
      setKeyboardShortcuts: (enabled) => set({ keyboardShortcuts: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'oalacea-settings',
      partialize: (state) => ({
        reducedMotion: state.reducedMotion,
        screenReaderMode: state.screenReaderMode,
        quality: state.quality,
        autoQuality: state.autoQuality,
        qualitySettings: state.qualitySettings,
        isMobile: state.isMobile,
        theme: state.theme,
        keyboardShortcuts: state.keyboardShortcuts,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);

export const selectReducedMotion = (state: SettingsState) => state.reducedMotion;
export const selectScreenReaderMode = (state: SettingsState) => state.screenReaderMode;
export const selectQualitySettings = (state: SettingsState) => state.qualitySettings;
export const selectQualityPreset = (state: SettingsState) => state.quality;
export const selectAutoQuality = (state: SettingsState) => state.autoQuality;
export const selectIsMobile = (state: SettingsState) => state.isMobile;
export const selectAccessibilitySettings = (state: SettingsState) => ({
  reducedMotion: state.reducedMotion,
  screenReaderMode: state.screenReaderMode,
  keyboardShortcuts: state.keyboardShortcuts,
});
