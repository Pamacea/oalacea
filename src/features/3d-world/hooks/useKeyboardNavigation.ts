// Hook for keyboard navigation management
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '@/store/settings-store';

interface KeyboardNavigationState {
  currentFocus: string;
  focusableElements: string[];
  registerElement: (id: string, element: HTMLElement) => void;
  unregisterElement: (id: string) => void;
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  shortcuts: Record<string, string>;
  showShortcuts: boolean;
  toggleShortcuts: () => void;
}

const KEYBOARD_SHORTCUTS: Record<string, string> = {
  'Tab': 'Navigate between interactive elements',
  'Shift+Tab': 'Navigate backwards',
  'Escape': 'Close modals/menus',
  'Enter/Space': 'Activate focused element',
  'Arrow Keys': 'Move character (in 3D world)',
  'W/A/S/D': 'Move character (alternative)',
  'Shift': 'Sprint (hold while moving)',
  'E': 'Interact with nearby objects',
  'Space': 'Toggle camera mode (follow/free)',
  'H': 'Toggle help/shortcuts',
  'M': 'Toggle music',
  'R': 'Toggle reduced motion',
  'Alt+R': 'Toggle screen reader mode',
  '1-9': 'Quick select interactions',
  '/': 'Open command palette',
};

export function useKeyboardNavigation(): KeyboardNavigationState {
  const [currentFocus, setCurrentFocus] = useState<string>('');
  const [focusableElements, setFocusableElements] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const keyboardEnabled = useSettingsStore((s) => s.keyboardShortcuts);

  const registerElement = (id: string, element: HTMLElement) => {
    elementsRef.current.set(id, element);
    setFocusableElements(Array.from(elementsRef.current.keys()));
  };

  const unregisterElement = (id: string) => {
    elementsRef.current.delete(id);
    setFocusableElements(Array.from(elementsRef.current.keys()));
  };

  const focusNext = () => {
    const currentIndex = focusableElements.indexOf(currentFocus);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    const nextId = focusableElements[nextIndex];
    const nextElement = elementsRef.current.get(nextId);
    nextElement?.focus();
    setCurrentFocus(nextId);
  };

  const focusPrevious = () => {
    const currentIndex = focusableElements.indexOf(currentFocus);
    const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    const prevId = focusableElements[prevIndex];
    const prevElement = elementsRef.current.get(prevId);
    prevElement?.focus();
    setCurrentFocus(prevId);
  };

  const focusFirst = () => {
    if (focusableElements.length > 0) {
      const firstId = focusableElements[0];
      const firstElement = elementsRef.current.get(firstId);
      firstElement?.focus();
      setCurrentFocus(firstId);
    }
  };

  const focusLast = () => {
    if (focusableElements.length > 0) {
      const lastId = focusableElements[focusableElements.length - 1];
      const lastElement = elementsRef.current.get(lastId);
      lastElement?.focus();
      setCurrentFocus(lastId);
    }
  };

  const toggleShortcuts = () => {
    setShowShortcuts((prev) => !prev);
  };

  useEffect(() => {
    if (!keyboardEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          toggleShortcuts();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardEnabled]);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const id = target.getAttribute('data-nav-id');
      if (id) {
        setCurrentFocus(id);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  return {
    currentFocus,
    focusableElements,
    registerElement,
    unregisterElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    shortcuts: KEYBOARD_SHORTCUTS,
    showShortcuts,
    toggleShortcuts,
  };
}

export default useKeyboardNavigation;

export interface KeyboardNavProps {
  navId: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function useKeyboardNavItem({ navId, onFocus, onBlur }: KeyboardNavProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute('data-nav-id') === navId) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          target.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navId]);

  return {
    'data-nav-id': navId,
    tabIndex: 0,
    onFocus,
    onBlur,
  };
}
