'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCharacterStore } from '@/features/3d-world/store';
import { useWorldStore } from '@/features/3d-world/store';
import type { WorldType } from '@/core/3d/scenes/types';

export interface TourStop {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
  world: WorldType;
  duration?: number; // Time to spend at this stop in ms
  highlightId?: string; // ID of object to highlight
}

export interface GuidedTour {
  id: string;
  name: string;
  description: string;
  stops: TourStop[];
  estimatedDuration: number; // in minutes
}

const DEV_WORLD_STOPS: TourStop[] = [
  {
    id: 'dev-spawn',
    position: [0, 0.5, 5],
    title: 'Welcome to Dev World',
    description: 'This is the Imperium, inspired by Warhammer 40k. Here you\'ll find technical projects and development work.',
    world: 'dev',
    duration: 10000,
  },
  {
    id: 'dev-pillars',
    position: [0, 0.5, 15],
    title: 'The Imperial Pillars',
    description: 'These gothic pillars represent the foundational technologies: React, Next.js, Three.js, and TypeScript.',
    world: 'dev',
    duration: 8000,
  },
  {
    id: 'dev-terminals',
    position: [12, 0.5, -8],
    title: 'Dev Terminals',
    description: 'Interactive terminals showcasing live code examples and technical documentation.',
    world: 'dev',
    duration: 12000,
  },
  {
    id: 'dev-portal',
    position: [0, 0.5, 0],
    title: 'The Portal',
    description: 'This gateway connects to the Art World underground. Shall we explore?',
    world: 'dev',
    duration: 8000,
  },
];

const ART_WORLD_STOPS: TourStop[] = [
  {
    id: 'art-spawn',
    position: [0, 0.5, 5],
    title: 'Welcome to Art World',
    description: 'The Underground - a neon-lit brutalist space showcasing creative work and street art aesthetics.',
    world: 'art',
    duration: 10000,
  },
  {
    id: 'art-walls',
    position: [-20, 0.5, -15],
    title: 'Concrete Walls',
    description: 'Raw concrete textures representing the canvas for urban creativity and street art.',
    world: 'art',
    duration: 8000,
  },
  {
    id: 'art-neon',
    position: [0, 0.5, -25],
    title: 'Neon Gallery',
    description: 'Vibrant neon signs illuminating featured creative works and design projects.',
    world: 'art',
    duration: 10000,
  },
  {
    id: 'art-portal',
    position: [0, 0.5, 0],
    title: 'Return to Imperium',
    description: 'The portal back to the Dev World. Your tour concludes here.',
    world: 'art',
    duration: 8000,
  },
];

const ALL_WORLDS_STOPS: TourStop[] = [
  ...DEV_WORLD_STOPS,
  ...ART_WORLD_STOPS,
];

export const GUIDED_TOURS: Record<string, GuidedTour> = {
  'dev-world': {
    id: 'dev-world',
    name: 'Dev World Tour',
    description: 'Explore the technical side of the portfolio in the Imperium.',
    stops: DEV_WORLD_STOPS,
    estimatedDuration: 5,
  },
  'art-world': {
    id: 'art-world',
    name: 'Art World Tour',
    description: 'Discover creative works in the Underground gallery.',
    stops: ART_WORLD_STOPS,
    estimatedDuration: 5,
  },
  'all-worlds': {
    id: 'all-worlds',
    name: 'Complete Portfolio Tour',
    description: 'A comprehensive tour of both Dev and Art worlds.',
    stops: ALL_WORLDS_STOPS,
    estimatedDuration: 10,
  },
};

export interface UseGuidedTourOptions {
  tourId?: string;
  onStart?: () => void;
  onStop?: () => void;
  onComplete?: () => void;
  onStopChange?: (stop: TourStop | null) => void;
}

export function useGuidedTour({
  tourId = 'dev-world',
  onStart,
  onStop,
  onComplete,
  onStopChange,
}: UseGuidedTourOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visitedStops, setVisitedStops] = useState<Set<string>>(new Set());

  const setPosition = useCharacterStore((s) => s.setPosition);
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const currentWorld = useWorldStore((s) => s.currentWorld);

  const tour = useMemo(() => GUIDED_TOURS[tourId], [tourId]);
  const currentStop = tour?.stops[currentStopIndex];
  const progress = tour ? (currentStopIndex / tour.stops.length) * 100 : 0;
  const isComplete = tour ? currentStopIndex >= tour.stops.length : false;

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStopIndex(0);
    setVisitedStops(new Set());
    onStart?.();

    if (tour && tour.stops[0]) {
      const firstStop = tour.stops[0];
      if (firstStop.world !== currentWorld) {
        switchWorld(firstStop.world);
      }
      setPosition(firstStop.position);
      onStopChange?.(firstStop);
    }
  }, [tour, currentWorld, setPosition, switchWorld, onStart, onStopChange]);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    onStop?.();
    onStopChange?.(null);
  }, [onStop, onStopChange]);

  const nextStop = useCallback(() => {
    if (!tour) return;

    const nextIndex = currentStopIndex + 1;

    if (nextIndex >= tour.stops.length) {
      setIsActive(false);
      onComplete?.();
      onStopChange?.(null);
      return;
    }

    setCurrentStopIndex(nextIndex);
    const nextStop = tour.stops[nextIndex];

    if (nextStop.world !== currentWorld) {
      switchWorld(nextStop.world);
    }

    setPosition(nextStop.position);
    setVisitedStops(prev => new Set(prev).add(nextStop.id));
    onStopChange?.(nextStop);
  }, [tour, currentStopIndex, currentWorld, setPosition, switchWorld, onComplete, onStopChange]);

  const prevStop = useCallback(() => {
    if (!tour || currentStopIndex <= 0) return;

    const prevIndex = currentStopIndex - 1;
    setCurrentStopIndex(prevIndex);
    const prevStop = tour.stops[prevIndex];

    if (prevStop.world !== currentWorld) {
      switchWorld(prevStop.world);
    }

    setPosition(prevStop.position);
    onStopChange?.(prevStop);
  }, [tour, currentStopIndex, currentWorld, setPosition, switchWorld, onStopChange]);

  const skipTour = useCallback(() => {
    stopTour();
  }, [stopTour]);

  const pauseTour = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTour = useCallback(() => {
    setIsPaused(false);
  }, []);

  const jumpToStop = useCallback((stopId: string) => {
    if (!tour) return;

    const stopIndex = tour.stops.findIndex(s => s.id === stopId);
    if (stopIndex === -1) return;

    setCurrentStopIndex(stopIndex);
    const stop = tour.stops[stopIndex];

    if (stop.world !== currentWorld) {
      switchWorld(stop.world);
    }

    setPosition(stop.position);
    onStopChange?.(stop);
  }, [tour, currentWorld, setPosition, switchWorld, onStopChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isPaused) {
          resumeTour();
        } else {
          nextStop();
        }
      } else if (e.key === 'ArrowLeft') {
        prevStop();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (isPaused) {
          resumeTour();
        } else {
          pauseTour();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isPaused, nextStop, prevStop, skipTour, pauseTour, resumeTour]);

  return {
    tour,
    isActive,
    isPaused,
    isComplete,
    currentStop,
    currentStopIndex,
    totalStops: tour?.stops.length ?? 0,
    progress,
    visitedStops,
    startTour,
    stopTour,
    nextStop,
    prevStop,
    skipTour,
    pauseTour,
    resumeTour,
    jumpToStop,
  };
}
