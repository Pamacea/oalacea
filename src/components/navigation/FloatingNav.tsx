'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, FolderKanban, User, Mail, X } from 'lucide-react';
import { GlitchText } from '@/components/ui/imperium';
import { useLoadingStore } from '@/features/3d-world/store/loading-store';

const NAV_ITEMS = [
  { href: '/', label: 'HOME', icon: Home },
  { href: '/projets', label: 'FORGE', icon: FolderKanban },
  { href: '/blogs', label: 'ARCHIVES', icon: FileText },
  { href: '/about', label: 'ABOUT', icon: User },
  { href: '/contact', label: 'CONTACT', icon: Mail },
];

export function FloatingNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const isLoading = useLoadingStore((s) => s.isLoading);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Particle canvas background */}
      <canvas
        id="particles"
        className="fixed inset-0 pointer-events-none -z-10 opacity-30"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Floating Navigation Dock */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed w-auto bottom-6 left-1/2 -translate-x-1/2 z-[60]"
          >
        <div
          className={`relative bg-imperium-black-raise border-2 ${
            glitchActive ? 'border-imperium-crimson' : 'border-imperium-steel-dark'
          } rounded-none overflow-hidden`}
          style={{
            boxShadow: glitchActive
              ? '0 0 20px rgba(154,17,21,0.3), inset 0 0 10px rgba(154,17,21,0.1)'
              : '0 0 10px rgba(0,0,0,0.5), inset 0 0 5px rgba(212,175,55,0.05)',
          }}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-imperium-crimson via-imperium-gold to-imperium-teal"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            />
          </div>

          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="h-0.5 bg-imperium-crimson/30"
              animate={{ y: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-imperium-crimson" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-imperium-crimson" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-imperium-crimson" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-imperium-crimson" />

          {/* Nav Items */}
          <div className="relative z-10 flex items-center gap-1 px-2 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`flex w-16 h-14 flex-col items-center gap-1 px-3 py-2 transition-all ${
                        isActive
                          ? 'bg-imperium-crimson/20 text-imperium-crimson'
                          : 'text-imperium-steel hover:text-imperium-gold'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 border-2 border-imperium-crimson"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}

                      <Icon className="h-5 w-5 relative z-10" />
                      <span className="font-terminal text-[10px] uppercase tracking-wider relative z-10">
                        {item.label}
                      </span>

                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-imperium-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Noise overlay for atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </>
  );
}

/* Particle Effect Script */
export function ParticleEffect() {
  useEffect(() => {
    const canvas = document.getElementById('particles') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Guard against null
    const context = ctx;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = ['#9a1115', '#d4af37', '#4ecdc4', '#4a4f52'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    function animate() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
        context.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return null;
}
