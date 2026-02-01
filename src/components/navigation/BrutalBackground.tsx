'use client';

import { useEffect, useRef } from 'react';

export function BrutalBackground() {
  return (
    <>
      {/* Main background layer - BEHIND content */}
      <div className="fixed inset-0 -z-50 overflow-hidden bg-imperium-black-deep">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(154,17,21,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(154,17,21,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridScroll 20s linear infinite',
          }} />
        </div>

        {/* VERTICAL gradient instead of radial - keeps composition clean */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
          }} />
        </div>

        {/* Side gradients for depth */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/60 to-transparent" />
        </div>

        {/* Animated scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(154,17,21,0.15) 2px, rgba(154,17,21,0.15) 3px, transparent 3px)',
          }} />
        </div>

        {/* Moving scanline beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-imperium-crimson/30 blur-sm" style={{
            animation: 'scanlineBeam 6s linear infinite',
            boxShadow: '0 0 15px rgba(154,17,21,0.3)',
          }} />
        </div>
      </div>

      {/* CRT Screen curvature effect - subtle */}
      <div className="fixed inset-0 pointer-events-none -z-40">
        <div className="absolute inset-0" style={{
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.7), inset 0 0 20px rgba(0,0,0,0.5)',
        }} />
      </div>

      {/* CRT scanline overlay */}
      <div className="fixed inset-0 pointer-events-none -z-30 opacity-25">
        <div className="w-full h-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px, transparent 2px)',
        }} />
      </div>

      {/* Animated noise grain - BEHIND content */}
      <div className="fixed inset-0 pointer-events-none -z-20 opacity-15">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseCRT'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='15' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseCRT)' opacity='0.5'/%3E%3C/svg%3E")`,
          animation: 'noiseShift 0.5s steps(10) infinite',
        }} />
      </div>

      {/* Flicker effect */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        animation: 'screenFlicker 10s steps(10) infinite',
      }} />

      <style>{`
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }

        @keyframes scanlineBeam {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }

        @keyframes noiseShift {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.2; }
        }

        @keyframes screenFlicker {
          0%, 100% { opacity: 1; }
          5% { opacity: 0.99; }
          10% { opacity: 1; }
          15% { opacity: 0.97; }
          20% { opacity: 1; }
          40% { opacity: 0.98; }
          50% { opacity: 1; }
          55% { opacity: 0.99; }
          60% { opacity: 1; }
          80% { opacity: 0.99; }
        }
      `}</style>
    </>
  );
}

/* Brutal card wrapper component */
export function BrutalContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-imperium-black-raise/90 backdrop-blur-sm ${className}`}>
      {/* Corner brackets */}
      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-l border-t border-imperium-crimson" />
      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-r border-t border-imperium-crimson" />
      <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-l border-b border-imperium-crimson" />
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-r border-b border-imperium-crimson" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function BrutalCard({
  children,
  className,
  hovered = false,
}: {
  children: React.ReactNode;
  className?: string;
  hovered?: boolean;
}) {
  return (
    <div
      className={`relative bg-imperium-black/90 border overflow-hidden group ${className}`}
      style={{
        borderColor: hovered ? 'rgba(154,17,21,0.6)' : 'rgba(47,51,54,0.6)',
        boxShadow: hovered
          ? '0 0 20px rgba(154,17,21,0.25)'
          : '2px 2px 0 rgba(0,0,0,0.4)',
        transition: 'all 0.2s',
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-imperium-crimson/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-imperium-crimson/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-imperium-crimson/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-imperium-crimson/50" />

      {/* Scanline effect on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(154,17,21,0.3)_1px,rgba(154,17,21,0.3)_2px)]" />
      </div>

      {children}
    </div>
  );
}
