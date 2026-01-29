// ShareButton - Share current 3D view
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getCurrentWorldState } from '@/hooks/useWorldStateSync';
import { useWorldStore } from '@/store/3d-world-store';
import type { WorldType } from '@/core/3d/scenes/types';

interface ShareButtonProps {
  cameraX?: number;
  cameraZ?: number;
  showProject?: string;
  showBlog?: string;
}

export function ShareButton({
  cameraX = 0,
  cameraZ = 0,
  showProject,
  showBlog,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const currentWorld = useWorldStore((s) => s.currentWorld) as WorldType;

  const handleShare = useCallback(async () => {
    const state = getCurrentWorldState(currentWorld, cameraX, cameraZ, showProject, showBlog);

    if (navigator.share) {
      try {
        const url = `${window.location.origin}${window.location.pathname}?ws=${btoa(JSON.stringify(state))}`;
        await navigator.share({
          title: 'Oalacea 3D Portfolio',
          text: 'Découvrez mon portfolio 3D interactif',
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy URL to clipboard
      const url = `${window.location.origin}${window.location.pathname}?ws=${btoa(JSON.stringify(state))}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [currentWorld, cameraX, cameraZ, showProject, showBlog]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleShare}
            aria-label={copied ? 'Link copied to clipboard' : 'Share this view'}
            className={`
              w-10 h-10 rounded-lg backdrop-blur-md border
              flex items-center justify-center transition-all
              ${copied
                ? 'bg-green-600/80 border-green-400'
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50'
              }
            `}
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
              </svg>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-black/90 border-white/20 text-white">
          {copied ? 'Lien copié !' : 'Partager cette vue'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
