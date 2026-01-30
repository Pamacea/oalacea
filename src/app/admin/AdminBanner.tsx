'use client';

import { useState, useEffect } from 'react';
import { X, Monitor } from 'lucide-react';
import Link from 'next/link';

export function AdminBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('admin-banner-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('admin-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500/20 to-pink-500/20 border-b border-amber-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-amber-400" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-sm font-medium text-zinc-200">
                💡 Interface 3D disponible
              </span>
              <span className="text-xs text-zinc-400">
                Gérez vos blogs et projets directement depuis la scène 3D principale
              </span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-3 py-1 text-xs font-medium bg-amber-500 text-zinc-900 rounded hover:bg-amber-400 transition-colors"
            >
              Aller à la scène 3D
            </Link>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Masquer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Spacer to account for fixed banner */}
      <div className="h-14" />
    </>
  );
}
