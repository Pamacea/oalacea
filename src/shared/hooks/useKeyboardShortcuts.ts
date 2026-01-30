'use client';

import { useEffect, useCallback } from 'react';

type ShortcutHandler = () => void;
type ShortcutCondition = () => boolean;

interface Shortcut {
  key: string;
  handler: ShortcutHandler;
  condition?: ShortcutCondition;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase() ||
                       e.code === shortcut.key;

      if (keyMatch && (!shortcut.condition || shortcut.condition())) {
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useHelpModal(open: boolean, onOpenChange: (open: boolean) => void) {
  useKeyboardShortcuts([
    {
      key: '?',
      handler: () => onOpenChange(!open),
      condition: () => true,
    },
    {
      key: 'Escape',
      handler: () => onOpenChange(false),
      condition: () => open,
    },
  ]);
}
