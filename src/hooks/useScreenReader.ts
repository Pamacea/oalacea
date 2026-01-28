// Hook to detect and manage screen reader usage
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '@/store/settings-store';

interface ScreenReaderState {
  isScreenReaderActive: boolean;
  isScreenReaderMode: boolean;
  toggleScreenReaderMode: () => void;
  setScreenReaderMode: (enabled: boolean) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

export function useScreenReader(): ScreenReaderState {
  const [detectedScreenReader, setDetectedScreenReader] = useState(false);
  const announcementRef = useRef<HTMLDivElement | null>(null);

  const screenReaderMode = useSettingsStore((s) => s.screenReaderMode);
  const setScreenReaderMode = useSettingsStore((s) => s.setScreenReaderMode);
  const toggleScreenReaderMode = useSettingsStore((s) => s.toggleScreenReaderMode);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkScreenReader = () => {
      if (typeof window === 'undefined') return;

      const bodyElement = document.body;

      const testElement = document.createElement('div');
      testElement.setAttribute('aria-hidden', 'true');
      testElement.innerHTML = '&nbsp;';
      testElement.style.position = 'absolute';
      testElement.style.left = '-10000px';
      bodyElement.appendChild(testElement);

      const initialWidth = testElement.scrollWidth;

      testElement.setAttribute('aria-hidden', 'false');
      testElement.innerHTML = 'test';

      timeoutId = setTimeout(() => {
        const finalWidth = testElement.scrollWidth;
        const isSRActive = finalWidth > initialWidth;

        bodyElement.removeChild(testElement);
        setDetectedScreenReader(isSRActive);
      }, 100);
    };

    checkScreenReader();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isScreenReaderShortcut = e.altKey && (e.key === 'r' || e.key === 'R');
      if (isScreenReaderShortcut) {
        e.preventDefault();
        toggleScreenReaderMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleScreenReaderMode]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof document === 'undefined') return;

    const existingAnnouncer = document.getElementById(`a11y-announcer-${priority}`);
    if (existingAnnouncer) {
      existingAnnouncer.textContent = '';
      setTimeout(() => {
        existingAnnouncer.textContent = message;
      }, 100);
    } else {
      const announcer = document.createElement('div');
      announcer.id = `a11y-announcer-${priority}`;
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);

      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  };

  return {
    isScreenReaderActive: detectedScreenReader,
    isScreenReaderMode: screenReaderMode,
    toggleScreenReaderMode,
    setScreenReaderMode,
    announce,
  };
}

export default useScreenReader;
