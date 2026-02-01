// TextOnlyMode - Text-only fallback mode for screen readers
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settings-store';

interface TextOnlyModeProps {
  children: React.ReactNode;
  textContent?: {
    title: string;
    description: string;
    navigation?: Array<{ label: string; href: string; description: string }>;
    currentWorld?: string;
    availableInteractions?: Array<{ name: string; type: string; description: string }>;
  };
}

export function TextOnlyMode({ children, textContent }: TextOnlyModeProps) {
  const screenReaderMode = useSettingsStore((s) => s.screenReaderMode);
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (screenReaderMode) {
      setAnnouncement('Text-only mode enabled. 3D content is presented as structured text.');
    } else {
      setAnnouncement('3D visual mode enabled.');
    }
  }, [screenReaderMode]);

  const handleToggle = () => {
    useSettingsStore.getState().toggleScreenReaderMode();
  };

  if (!screenReaderMode) {
    return (
      <>
        {children}
        <button
          onClick={handleToggle}
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-slate-900 focus:text-white focus:p-4 focus:rounded-sm"
          aria-label="Enable text-only mode for screen readers"
        >
          Enable Text-Only Mode
        </button>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-amber-500">OALACEA</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              className="text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              Switch to 3D View
            </Button>
          </div>
          <p className="text-slate-400 text-lg">
            Interactive 3D Portfolio - Accessible Text Mode
          </p>
        </header>

        <div role="region" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        <nav aria-label="Main navigation" className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Navigation</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="/"
                className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Home / 3D World
              </a>
              <span className="text-slate-500 ml-2">- Return to the 3D interactive world</span>
            </li>
            <li>
              <a
                href="/blog"
                className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Blog
              </a>
              <span className="text-slate-500 ml-2">- Read articles and thoughts</span>
            </li>
            <li>
              <a
                href="/admin"
                className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Admin
              </a>
              <span className="text-slate-500 ml-2">- Content management (requires authentication)</span>
            </li>
          </ul>
        </nav>

        {textContent && (
          <main>
            <section aria-labelledby="world-info" className="mb-8">
              <h2 id="world-info" className="text-xl font-semibold mb-4 text-amber-400">
                Current World: {textContent.currentWorld || 'Dev World'}
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                {textContent.description}
              </p>
            </section>

            {textContent.availableInteractions && textContent.availableInteractions.length > 0 && (
              <section aria-labelledby="interactions-section" className="mb-8">
                <h2 id="interactions-section" className="text-xl font-semibold mb-4 text-amber-400">
                  Available Interactions
                </h2>
                <ul className="space-y-3">
                  {textContent.availableInteractions.map((interaction, index) => (
                    <li
                      key={index}
                      className="bg-slate-900 p-4 rounded-sm border border-slate-800"
                    >
                      <h3 className="font-semibold text-slate-200">{interaction.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Type: {interaction.type} - {interaction.description}
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        Press E when nearby to interact
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="controls-info" className="mb-8">
              <h2 id="controls-info" className="text-xl font-semibold mb-4 text-amber-400">
                Controls
              </h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900 p-3 rounded-sm">
                  <dt className="text-slate-400">Movement</dt>
                  <dd className="text-slate-200 font-mono">Right-click / WASD / Arrows</dd>
                </div>
                <div className="bg-slate-900 p-3 rounded-sm">
                  <dt className="text-slate-400">Sprint</dt>
                  <dd className="text-slate-200 font-mono">Hold Shift</dd>
                </div>
                <div className="bg-slate-900 p-3 rounded-sm">
                  <dt className="text-slate-400">Interact</dt>
                  <dd className="text-slate-200 font-mono">Press E</dd>
                </div>
                <div className="bg-slate-900 p-3 rounded-sm">
                  <dt className="text-slate-400">Camera Mode</dt>
                  <dd className="text-slate-200 font-mono">Press Space</dd>
                </div>
              </dl>
            </section>
          </main>
        )}

        <footer className="mt-12 pt-6 border-t border-slate-800 text-slate-500 text-sm">
          <p>OALACEA - Interactive 3D Portfolio</p>
          <p className="mt-2">
            This text-only mode provides full accessibility for screen reader users.
            All 3D content is represented as structured, navigable text.
          </p>
        </footer>
      </div>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        .focus\\:not-sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
    </div>
  );
}

export default TextOnlyMode;
