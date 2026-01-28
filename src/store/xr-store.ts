'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';

export type XRMode = 'none' | 'vr' | 'ar';
export type XRComfortLevel = 'low' | 'medium' | 'high';
export type XRMovementType = 'teleport' | 'smooth' | 'both';
export type XRTurnType = 'snap' | 'smooth';

export interface XRComfortSettings {
  level: XRComfortLevel;
  vignetteEnabled: boolean;
  tunnelingEnabled: boolean;
  vignetteIntensity: number;
  tunnelingIntensity: number;
}

export interface XRNavigationSettings {
  movementType: XRMovementType;
  turnType: XRTurnType;
  snapTurnAngle: number;
  movementSpeed: number;
  teleportEnabled: boolean;
  heightAdjustment: number;
}

export interface Screenshot {
  id: string;
  dataUrl: string;
  timestamp: number;
  filter: string;
  resolution: string;
}

interface XRState {
  isSupported: boolean;
  isVRSupported: boolean;
  isARSupported: boolean;
  currentMode: XRMode;
  enterVR: () => void;
  enterAR: () => void;
  exitXR: () => void;
  setSupported: (vr: boolean, ar: boolean) => void;
  comfortSettings: XRComfortSettings;
  updateComfortSettings: (settings: Partial<XRComfortSettings>) => void;
  navigationSettings: XRNavigationSettings;
  updateNavigationSettings: (settings: Partial<XRNavigationSettings>) => void;
  photoModeEnabled: boolean;
  setPhotoModeEnabled: (enabled: boolean) => void;
  screenshots: Screenshot[];
  addScreenshot: (screenshot: Screenshot) => void;
  removeScreenshot: (id: string) => void;
  clearScreenshots: () => void;
  handTrackingEnabled: boolean;
  setHandTrackingEnabled: (enabled: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;
  // Photo mode refs (stored outside persist)
  cameraRefs: { camera?: THREE.Camera; scene?: THREE.Scene; gl?: THREE.WebGLRenderer } | null;
  setCameraRefs: (refs: { camera?: THREE.Camera; scene?: THREE.Scene; gl?: THREE.WebGLRenderer }) => void;
  flash: boolean;
  setFlash: (value: boolean) => void;
  handleCapture: (() => void) | null;
  setHandleCapture: (fn: (() => void) | null) => void;
}

const DEFAULT_COMFORT_SETTINGS: XRComfortSettings = {
  level: 'medium',
  vignetteEnabled: true,
  tunnelingEnabled: false,
  vignetteIntensity: 0.5,
  tunnelingIntensity: 0.3,
};

const DEFAULT_NAVIGATION_SETTINGS: XRNavigationSettings = {
  movementType: 'both',
  turnType: 'snap',
  snapTurnAngle: 45,
  movementSpeed: 1.0,
  teleportEnabled: true,
  heightAdjustment: 0,
};

export const useXRStore = create<XRState>()(
  persist(
    (set) => ({
      isSupported: false,
      isVRSupported: false,
      isARSupported: false,
      currentMode: 'none',
      setSupported: (vr, ar) => set({ isSupported: vr || ar, isVRSupported: vr, isARSupported: ar }),
      enterVR: () => set({ currentMode: 'vr' }),
      enterAR: () => set({ currentMode: 'ar' }),
      exitXR: () => set({ currentMode: 'none' }),
      comfortSettings: DEFAULT_COMFORT_SETTINGS,
      updateComfortSettings: (settings) =>
        set((state) => ({
          comfortSettings: { ...state.comfortSettings, ...settings },
        })),
      navigationSettings: DEFAULT_NAVIGATION_SETTINGS,
      updateNavigationSettings: (settings) =>
        set((state) => ({
          navigationSettings: { ...state.navigationSettings, ...settings },
        })),
      photoModeEnabled: false,
      setPhotoModeEnabled: (enabled) => set({ photoModeEnabled: enabled }),
      screenshots: [],
      addScreenshot: (screenshot) =>
        set((state) => ({
          screenshots: [...state.screenshots, screenshot],
        })),
      removeScreenshot: (id) =>
        set((state) => ({
          screenshots: state.screenshots.filter((s) => s.id !== id),
        })),
      clearScreenshots: () => set({ screenshots: [] }),
      handTrackingEnabled: true,
      setHandTrackingEnabled: (enabled) => set({ handTrackingEnabled: enabled }),
      hapticEnabled: true,
      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
      // Non-persisted state for photo mode
      cameraRefs: null,
      setCameraRefs: (refs) => set({ cameraRefs: refs }),
      flash: false,
      setFlash: (value) => set({ flash: value }),
      handleCapture: null,
      setHandleCapture: (fn) => set({ handleCapture: fn }),
    }),
    {
      name: 'oalacea-xr',
      partialize: (state) => ({
        comfortSettings: state.comfortSettings,
        navigationSettings: state.navigationSettings,
        handTrackingEnabled: state.handTrackingEnabled,
        hapticEnabled: state.hapticEnabled,
        screenshots: state.screenshots,
        photoModeEnabled: state.photoModeEnabled,
      }),
    }
  )
);
