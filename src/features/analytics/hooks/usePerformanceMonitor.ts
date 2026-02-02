// usePerformanceMonitor - FPS monitoring hook for 3D performance
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSettingsStore } from '@/store/settings-store';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
}

interface PerformanceMonitorOptions {
  lowFpsThreshold?: number;
  highFpsThreshold?: number;
  sampleSize?: number;
  autoAdjust?: boolean;
}

export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
  const {
    lowFpsThreshold = 30,
    highFpsThreshold = 50,
    sampleSize = 60,
    autoAdjust = true,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
  });
  const [lastFrameTime, setLastFrameTime] = useState<number>(() => performance.now());

  const frameTimes = useRef<number[]>([]);
  const fpsSamples = useRef<number[]>([]);
  const lowPerformanceFrames = useRef<number>(0);
  const highPerformanceFrames = useRef<number>(0);

  const currentQuality = useSettingsStore((s) => s.quality);
  const autoQuality = useSettingsStore((s) => s.autoQuality);
  const setQuality = useSettingsStore((s) => s.setQuality);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTime;
    setLastFrameTime(now);

    frameTimes.current.push(delta);
    if (frameTimes.current.length > sampleSize) {
      frameTimes.current.shift();
    }

    const avgFrameTime =
      frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
    const fps = 1000 / avgFrameTime;

    fpsSamples.current.push(fps);
    if (fpsSamples.current.length > sampleSize) {
      fpsSamples.current.shift();
    }

    const avgFps =
      fpsSamples.current.reduce((a, b) => a + b, 0) / fpsSamples.current.length;

    const isLowPerformance = avgFps < lowFpsThreshold;

    setMetrics({
      fps: Math.round(avgFps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      isLowPerformance,
    });

    if (autoQuality && autoAdjust) {
      if (avgFps < lowFpsThreshold) {
        lowPerformanceFrames.current += 1;
        highPerformanceFrames.current = 0;

        if (lowPerformanceFrames.current > sampleSize * 2) {
          if (currentQuality !== 'low') {
            console.warn(`[PerformanceMonitor] Low FPS detected (${Math.round(avgFps)}), reducing quality`);
            setQuality('low');
            lowPerformanceFrames.current = 0;
          }
        }
      } else if (avgFps > highFpsThreshold) {
        highPerformanceFrames.current += 1;
        lowPerformanceFrames.current = 0;

        if (highPerformanceFrames.current > sampleSize * 3) {
          if (currentQuality === 'low') {
            console.info(`[PerformanceMonitor] Performance improved (${Math.round(avgFps)}), increasing quality`);
            setQuality('medium');
            highPerformanceFrames.current = 0;
          }
        }
      } else {
        lowPerformanceFrames.current = Math.max(0, lowPerformanceFrames.current - 1);
        highPerformanceFrames.current = Math.max(0, highPerformanceFrames.current - 1);
      }
    }

    return fps;
  }, [lowFpsThreshold, highFpsThreshold, sampleSize, autoQuality, autoAdjust, currentQuality, setQuality, lastFrameTime]);

  useFrame(() => {
    measureFPS();
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        frameTimes.current = [];
        fpsSamples.current = [];
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return metrics;
}

export interface PerformanceData {
  currentFPS: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameTime: number;
  samples: number;
}

export function useDetailedPerformanceMonitor(): PerformanceData {
  const [data, setData] = useState<PerformanceData>({
    currentFPS: 60,
    averageFPS: 60,
    minFPS: 60,
    maxFPS: 60,
    frameTime: 16.67,
    samples: 0,
  });

  const fpsHistory = useRef<number[]>([]);
  const [lastTime, setLastTime] = useState<number>(() => performance.now());
  const frameCount = useRef<number>(0);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime;
    setLastTime(now);

    const fps = 1000 / delta;
    frameCount.current += 1;

    fpsHistory.current.push(fps);
    if (fpsHistory.current.length > 300) {
      fpsHistory.current.shift();
    }

    if (frameCount.current % 10 === 0) {
      const history = fpsHistory.current;
      setData({
        currentFPS: Math.round(fps),
        averageFPS: Math.round(history.reduce((a, b) => a + b, 0) / history.length),
        minFPS: Math.round(Math.min(...history)),
        maxFPS: Math.round(Math.max(...history)),
        frameTime: Math.round(delta * 100) / 100,
        samples: history.length,
      });
    }
  });

  return data;
}

export default usePerformanceMonitor;
