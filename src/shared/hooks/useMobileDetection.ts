'use client';

import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTouch: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export function useMobileDetection(): MobileDetectionResult {
  const [result, setResult] = useState<MobileDetectionResult>({
    isMobile: false,
    isTouch: false,
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/.test(ua);
      const isMobile = isIOS || isAndroid || window.innerWidth < 768;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setResult({ isMobile, isTouch, isIOS, isAndroid });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return result;
}
