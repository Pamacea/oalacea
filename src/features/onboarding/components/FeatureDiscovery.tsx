// FeatureDiscovery - Progressive feature unlocking with "New!" badges and contextual tooltips
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgressionStore, FEATURE_DEFINITIONS } from '@/features/onboarding/store';
import { useOnboardingStore } from '@/features/onboarding/store';
import { cn } from '@/lib/utils';

interface FeatureDiscoveryProps {
  /** Auto-discover features on mount (for testing) */
  autoDiscover?: string[];
}

export function FeatureDiscovery({ autoDiscover }: FeatureDiscoveryProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [dismissedTooltips, setDismissedTooltips] = useState<Set<string>>(new Set());

  const {
    discoverFeature,
    discovered,
    completed,
  } = useProgressionStore();

  const { firstVisit } = useOnboardingStore();

  // Auto-discover features for testing
  useEffect(() => {
    if (autoDiscover) {
      autoDiscover.forEach((id) => {
        const def = FEATURE_DEFINITIONS[id as keyof typeof FEATURE_DEFINITIONS];
        if (def) {
          setTimeout(() => discoverFeature(def.key), 500);
        }
      });
    }
  }, [autoDiscover, discoverFeature]);

  // Auto-show tooltip for new features
  useEffect(() => {
    if (!firstVisit) {
      discovered.forEach((featureId, index) => {
        const timer = setTimeout(() => {
          if (!dismissedTooltips.has(featureId)) {
            setActiveTooltip(featureId);
          }
        }, index * 1000);
        return () => clearTimeout(timer);
      });
    }
  }, [discovered, firstVisit, dismissedTooltips]);

  const handleDismiss = (featureId: string) => {
    setActiveTooltip(null);
    setDismissedTooltips((prev) => new Set([...prev, featureId]));
  };

  const isDiscovered = (featureId: string) =>
    discovered.includes(featureId as any);

  return (
    <>
      {/* Feature notification toasts */}
      <AnimatePresence>
        {activeTooltip && (
          <FeatureTooltip
            featureId={activeTooltip}
            onDismiss={() => handleDismiss(activeTooltip)}
          />
        )}
      </AnimatePresence>

      {/* Feature badges (to be used throughout the UI) */}
      <FeatureBadges isDiscovered={isDiscovered} />
    </>
  );
}

interface FeatureTooltipProps {
  featureId: string;
  onDismiss: () => void;
}

function FeatureTooltip({ featureId, onDismiss }: FeatureTooltipProps) {
  const feature = FEATURE_DEFINITIONS[featureId];
  if (!feature) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-24 right-8 z-50 w-80"
    >
      <div className="relative overflow-hidden rounded-sm border border-imperium-gold/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-imperium-gold/10 to-imperium-crimson/10" />

        {/* Header */}
        <div className="relative mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-imperium-gold/20">
              <Sparkles className="h-4 w-4 text-imperium-gold" />
            </div>
            <div>
              <Badge className="bg-imperium-crimson text-white">New!</Badge>
              <h4 className="font-semibold text-white">{feature.title}</h4>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Description */}
        <p className="relative text-sm text-slate-300">{feature.description}</p>
      </div>
    </motion.div>
  );
}

interface FeatureBadgesProps {
  isDiscovered: (featureId: string) => boolean;
}

export function FeatureBadges({ isDiscovered }: FeatureBadgesProps) {
  const [showBadges, setShowBadges] = useState(true);

  // Only show badges on features that have been discovered but are "new"
  const newFeatures = Object.entries(FEATURE_DEFINITIONS)
    .filter(([id]) => isDiscovered(id))
    .slice(0, 3); // Show max 3 badges

  if (!showBadges || newFeatures.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-8 left-8 z-40 flex flex-col gap-2"
    >
      <button
        onClick={() => setShowBadges(false)}
        className="flex items-center gap-2 rounded-sm bg-slate-950/80 px-3 py-2 text-xs text-slate-400 hover:text-white"
      >
        <Info className="h-3 w-3" />
        Newly Discovered
      </button>
      {newFeatures.map(([id, feature]) => (
        <motion.div
          key={id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: parseInt(id) * 0.1 }}
          className="flex items-center gap-2 rounded-sm bg-slate-950/80 px-3 py-2"
        >
          <Sparkles className="h-3 w-3 text-imperium-gold" />
          <span className="text-sm text-slate-300">{feature.title}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Contextual tooltip component for highlighting features in the UI
interface ContextualTooltipProps {
  featureId: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  show?: boolean;
}

export function ContextualTooltip({
  featureId,
  children,
  position = 'top',
  show = true,
}: ContextualTooltipProps) {
  const isDiscovered = useProgressionStore((s) => s.discovered.includes(featureId as any));
  const [localShow, setLocalShow] = useState(false);

  // Only show if not yet discovered and show is true
  const shouldShow = show && !isDiscovered && localShow;

  useEffect(() => {
    // Auto-show after a delay if not discovered
    if (!isDiscovered && show) {
      const timer = setTimeout(() => setLocalShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isDiscovered, show]);

  return (
    <div className="relative inline-block">
      {children}

      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              'absolute z-50 whitespace-nowrap rounded-sm bg-imperium-gold px-2 py-1 text-xs font-semibold text-black',
              {
                'bottom-full left-1/2 -translate-x-1/2 mb-2': position === 'top',
                'top-full left-1/2 -translate-x-1/2 mt-2': position === 'bottom',
                'right-full top-1/2 -translate-y-1/2 mr-2': position === 'left',
                'left-full top-1/2 -translate-y-1/2 ml-2': position === 'right',
              }
            )}
          >
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Try this!</span>
            </div>
            {/* Arrow */}
            <div
              className={cn('absolute bg-imperium-gold', {
                'top-full left-1/2 -translate-x-1/2': position === 'top',
                'bottom-full left-1/2 -translate-x-1/2': position === 'bottom',
                'left-full top-1/2 -translate-y-1/2': position === 'left',
                'right-full top-1/2 -translate-y-1/2': position === 'right',
              })}
              style={{
                width: '6px',
                height: '6px',
                transform: 'rotate(45deg)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// "New!" badge component for UI elements
interface NewBadgeProps {
  featureId: string;
  className?: string;
}

export function NewBadge({ featureId, className }: NewBadgeProps) {
  const isDiscovered = useProgressionStore((s) => s.discovered.includes(featureId as any));
  const isRecentlyDiscovered = useProgressionStore((s) => {
    const discoveredAt = s.discoveredAt[featureId];
    if (!discoveredAt) return false;
    const hoursSinceDiscovery = (Date.now() - discoveredAt) / (1000 * 60 * 60);
    return hoursSinceDiscovery < 24; // Show "New!" for 24 hours
  });

  if (!isRecentlyDiscovered || isDiscovered && !isRecentlyDiscovered) return null;

  return (
    <Badge
      className={cn(
        'ml-2 bg-imperium-crimson text-white animate-pulse',
        className
      )}
    >
      New!
    </Badge>
  );
}

// Hook to trigger feature discovery
export function useFeatureDiscovery() {
  const discoverFeature = useProgressionStore((s) => s.discoverFeature);

  return {
    discover: (featureId: string) => {
      const def = FEATURE_DEFINITIONS[featureId];
      if (def) {
        discoverFeature(def.key);
      }
    },
    discoverMovement: () => discoverFeature(FEATURE_DEFINITIONS.movement.key),
    discoverInteraction: () => discoverFeature(FEATURE_DEFINITIONS.interaction.key),
    discoverWorldSwitch: () => discoverFeature(FEATURE_DEFINITIONS['world-switch'].key),
    discoverBlog: () => discoverFeature(FEATURE_DEFINITIONS.blog.key),
    discoverPortfolio: () => discoverFeature(FEATURE_DEFINITIONS.portfolio.key),
    discoverAdmin: () => discoverFeature(FEATURE_DEFINITIONS.admin.key),
  };
}
