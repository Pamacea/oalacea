'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMobileDetection } from '@/shared/hooks';
import { useCharacterStore } from '@/features/3d-world/store';
import { setJoystickActive } from '@/features/3d-world/hooks';

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 50;
const MAX_DISTANCE = JOYSTICK_SIZE / 2 - KNOB_SIZE / 2;
const DEADZONE = 10;

export function VirtualJoystick() {
  const { isMobile, isTouch } = useMobileDetection();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [containerCenter, setContainerCenter] = useState({ x: 0, y: 0 });
  const setInput = useCharacterStore((s) => s.setInput);

  const resetInputs = () => {
    setInput('forward', false);
    setInput('backward', false);
    setInput('left', false);
    setInput('right', false);
  };

  const updateInputs = (x: number, y: number) => {
    const forward = y < -DEADZONE;
    const backward = y > DEADZONE;
    const left = x < -DEADZONE;
    const right = x > DEADZONE;

    setInput('forward', forward);
    setInput('backward', backward);
    setInput('left', left);
    setInput('right', right);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setContainerCenter({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setIsActive(true);
    setJoystickActive(true);

    if (e.target instanceof HTMLElement) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive) return;

    const dx = e.clientX - containerCenter.x;
    const dy = e.clientY - containerCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const clampedDistance = Math.min(distance, MAX_DISTANCE);
    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;

    setPosition({ x, y });
    updateInputs(x, y);

    if (distance > DEADZONE && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
    resetInputs();
    setJoystickActive(false);

    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    return () => {
      resetInputs();
      setJoystickActive(false);
    };
  }, [resetInputs]);

  if (!isMobile || !isTouch) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 left-4 z-30"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        width: JOYSTICK_SIZE,
        height: JOYSTICK_SIZE,
      }}
    >
      <motion.div
        className="relative rounded-sm bg-white/5 border border-white/10 backdrop-blur-sm"
        style={{
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
        }}
        animate={{
          scale: isActive ? 0.95 : 1,
          borderColor: isActive ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        }}
        transition={{ duration: 0.1 }}
      >
        <motion.div
          className="absolute rounded-sm bg-gradient-to-br from-amber-400/80 to-amber-600/80 shadow-lg"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            left: JOYSTICK_SIZE / 2 - KNOB_SIZE / 2,
            top: JOYSTICK_SIZE / 2 - KNOB_SIZE / 2,
          }}
          animate={{
            x: position.x,
            y: position.y,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-3 bg-white/20" />
          <div className="absolute w-3 h-px bg-white/20" />
        </div>
      </motion.div>

      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/40 whitespace-nowrap">
        WASD
      </div>
    </div>
  );
}
