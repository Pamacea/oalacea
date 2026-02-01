// QualityManager - 3D quality settings manager
'use client';

import { useEffect, createContext, useContext, ReactNode } from 'react';
import * as THREE from 'three';
import { useSettingsStore, QualityPreset, QualitySettings } from '@/store/settings-store';

interface QualityManagerContextValue {
  currentQuality: QualityPreset;
  qualitySettings: QualitySettings;
  setQuality: (quality: QualityPreset) => void;
  isAutoQuality: boolean;
}

const QualityManagerContext = createContext<QualityManagerContextValue | null>(null);

interface QualityManagerProps {
  children: ReactNode;
  onQualityChange?: (quality: QualityPreset) => void;
  showNotification?: boolean;
}

export function QualityManager({ children, onQualityChange, showNotification = true }: QualityManagerProps) {
  const currentQuality = useSettingsStore((s) => s.quality);
  const qualitySettings = useSettingsStore((s) => s.qualitySettings);
  const setQuality = useSettingsStore((s) => s.setQuality);
  const autoQuality = useSettingsStore((s) => s.autoQuality);

  const handleSetQuality = (quality: QualityPreset) => {
    if (quality !== currentQuality) {
      setQuality(quality);
      onQualityChange?.(quality);

      if (showNotification) {
        showQualityNotification(quality);
      }

      applyQualitySettings(quality);
    }
  };

  const applyQualitySettings = (quality: QualityPreset) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const settings = useSettingsStore.getState().qualitySettings;

    canvas.style.imageRendering = quality === 'low' ? 'pixelated' : 'auto';

    const renderer = (canvas as { __threeRenderer?: THREE.WebGLRenderer }).__threeRenderer;
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'low' ? 1 : 2));
      renderer.shadowMap.type = getShadowMapType(settings.shadowMapType);
    }
  };

  useEffect(() => {
    applyQualitySettings(currentQuality);
  }, [currentQuality]);

  useEffect(() => {
    useSettingsStore.getState().detectMobileAndApplyQuality();
  }, []);

  return (
    <QualityManagerContext.Provider
      value={{
        currentQuality,
        qualitySettings,
        setQuality: handleSetQuality,
        isAutoQuality: autoQuality,
      }}
    >
      {children}
    </QualityManagerContext.Provider>
  );
}

export function useQualityManager() {
  const context = useContext(QualityManagerContext);
  if (!context) {
    throw new Error('useQualityManager must be used within QualityManager');
  }
  return context;
}

function showQualityNotification(quality: QualityPreset) {
  const messages: Record<QualityPreset, string> = {
    low: 'Low quality mode enabled for better performance',
    medium: 'Medium quality mode enabled',
    high: 'High quality mode enabled',
    auto: 'Auto quality mode enabled',
  };

  const existing = document.getElementById('quality-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'quality-notification';
  notification.className =
    'fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-sm shadow-lg border border-slate-700 animate-in slide-in-from-bottom-2 fade-in duration-300';
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-2 h-2 rounded-full ${quality === 'low' ? 'bg-yellow-500' : quality === 'medium' ? 'bg-blue-500' : 'bg-green-500'}"></div>
      <span class="text-sm">${messages[quality]}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('opacity-0');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function getShadowMapType(type: QualitySettings['shadowMapType']): THREE.ShadowMapType {
  switch (type) {
    case 'basic':
      return THREE.BasicShadowMap;
    case 'pcf':
      return THREE.PCFShadowMap;
    case 'pcfsoft':
      return THREE.PCFSoftShadowMap;
    default:
      return THREE.PCFSoftShadowMap;
  }
}

export interface QualitySelectorProps {
  className?: string;
}

export function QualitySelector({ className = '' }: QualitySelectorProps) {
  const { currentQuality, setQuality, isAutoQuality } = useQualityManager();
  const autoQuality = useSettingsStore((s) => s.autoQuality);
  const setAutoQuality = useSettingsStore((s) => s.setAutoQuality);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Auto Quality</span>
        <button
          onClick={() => setAutoQuality(!autoQuality)}
          className={`w-12 h-6 rounded-full transition-colors ${
            autoQuality ? 'bg-amber-500' : 'bg-slate-700'
          }`}
          aria-pressed={autoQuality}
          aria-label="Toggle auto quality"
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              autoQuality ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {!isAutoQuality && (
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as QualityPreset[]).map((quality) => (
            <button
              key={quality}
              onClick={() => setQuality(quality)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                currentQuality === quality
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              aria-pressed={currentQuality === quality}
              aria-label={`Set quality to ${quality}`}
            >
              {quality}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QualityManager;
