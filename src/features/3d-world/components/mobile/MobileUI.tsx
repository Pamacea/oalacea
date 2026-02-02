// MobileUI - Bottom sheet UI for mobile devices
// Collapsed by default, expandable with drag handle
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWorldStore } from '@/features/3d-world/store';
import { useOverlayStore } from '@/features/3d-world/store';

const DRAG_THRESHOLD = 50;
const SNAP_HEIGHTS = {
  collapsed: 60,
  expanded: 280,
};

export function MobileUI(): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showRotationHint, setShowRotationHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWorldStore = useWorldStore((s) => s.currentWorld);
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const isOverlayOpen = useOverlayStore((s) => s.isOpen);
  const closeOverlay = useOverlayStore((s) => s.closeOverlay);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, DRAG_THRESHOLD], [1, 0.5]);

  useEffect(() => {
    const handleResize = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);

      if (landscape && showRotationHint) {
        setShowRotationHint(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showRotationHint]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const shouldExpand = info.offset.y < -DRAG_THRESHOLD;
      const shouldCollapse = info.offset.y > DRAG_THRESHOLD;

      if (shouldExpand && !isExpanded) {
        setIsExpanded(true);
      } else if (shouldCollapse && isExpanded) {
        setIsExpanded(false);
      }
    },
    [isExpanded]
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSwitchWorld = useCallback(() => {
    switchWorld(currentWorldStore === 'dev' ? 'art' : 'dev');
  }, [currentWorldStore, switchWorld]);

  const worldColors = {
    dev: {
      primary: '#d4af37',
      secondary: '#8b0000',
      bg: 'from-slate-900/95 to-slate-800/95',
    },
    art: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      bg: 'from-blue-900/95 to-slate-900/95',
    },
  }[currentWorldStore];

  return (
    <>
      <AnimatePresence>
        {isLandscape && showRotationHint && !isOverlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowRotationHint(false)}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="inline-block mb-4"
              >
                <svg className="w-16 h-16 text-d4af37 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">Rotate Your Device</h3>
              <p className="text-sm text-white/70 mb-4">For the best experience, use portrait mode</p>
              <Button onClick={() => setShowRotationHint(false)} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Continue Anyway
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom"
        style={{ y, opacity }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{ height: isExpanded ? SNAP_HEIGHTS.expanded : SNAP_HEIGHTS.collapsed }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={`h-full bg-gradient-to-t ${worldColors.bg} backdrop-blur-md border-t border-white/10 rounded-t-2xl shadow-2xl`}>
          <motion.button
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-6 flex items-center justify-center touch-none"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-1 bg-white/30 rounded-sm"
            />
          </motion.button>

          <div className="px-4 pt-6 pb-4">
            {!isExpanded ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center"
                    style={{ backgroundColor: worldColors.primary + '30' }}
                  >
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: worldColors.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {currentWorldStore === 'dev' ? 'Dev World' : 'Art World'}
                    </p>
                    <p className="text-xs text-white/60">
                      {currentWorldStore === 'dev' ? 'Warhammer 40k Style' : 'Street Art Vibes'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSwitchWorld}
                    aria-label="Switch world"
                    className="h-9 w-9 rounded-sm bg-white/10 hover:bg-white/20 text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: worldColors.primary + '30' }}
                    >
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: worldColors.primary }} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        {currentWorldStore === 'dev' ? 'Dev World' : 'Art World'}
                      </p>
                      <p className="text-xs text-white/60">
                        {currentWorldStore === 'dev' ? 'Imperium Awaits' : 'Canvas of Creativity'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="lg"
                    onClick={handleSwitchWorld}
                    aria-label="Switch world"
                    className="h-14 rounded-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 flex flex-col items-center gap-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-xs">Switch World</span>
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => window.location.href = '/blog'}
                    aria-label="Go to blog"
                    className="h-14 rounded-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 flex flex-col items-center gap-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span className="text-xs">Blog</span>
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => window.location.href = '/projects'}
                    aria-label="Go to projects"
                    className="h-14 rounded-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 flex flex-col items-center gap-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    <span className="text-xs">Projects</span>
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => window.location.href = '/about'}
                    aria-label="Go to about"
                    className="h-14 rounded-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 flex flex-col items-center gap-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">About</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-30" />

      {isOverlayOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={closeOverlay}
          aria-label="Close overlay"
          className="fixed top-20 right-4 z-50 w-12 h-12 rounded-sm bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center touch-none"
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      )}
    </>
  );
}
