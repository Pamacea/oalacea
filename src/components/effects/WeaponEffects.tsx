'use client';

import { useEffect, useRef } from 'react';

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  active: boolean;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  size: number;
  active: boolean;
  frame: number;
  maxFrames: number;
}

export function WeaponEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastFireRef = useRef(0);

  const fireProjectile = () => {
    const side = Math.random() > 0.5 ? 0 : window.innerWidth;
    const y = 50 + Math.random() * (window.innerHeight * 0.5);
    const targetX = Math.random() * window.innerWidth;
    const targetY = 100 + Math.random() * (window.innerHeight * 0.6);

    // Calculate velocity vector
    const dx = targetX - side;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 12 + Math.random() * 8;

    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    projectilesRef.current.push({
      id: Date.now() + Math.random(),
      x: side,
      y,
      vx,
      vy,
      color: Math.random() > 0.5 ? '#ff4500' : '#ffd700',
      active: true,
    });

    // Limit projectiles
    if (projectilesRef.current.length > 5) {
      projectilesRef.current.shift();
    }
  };

  const createExplosion = (x: number, y: number) => {
    explosionsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      size: 40 + Math.random() * 30,
      active: true,
      frame: 0,
      maxFrames: 25 + Math.floor(Math.random() * 10),
    });

    // Limit explosions
    if (explosionsRef.current.length > 3) {
      explosionsRef.current.shift();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Fire randomly
    const fireRandom = () => {
      const now = Date.now();
      if (now - lastFireRef.current > 1000 + Math.random() * 2000) {
        fireProjectile();
        lastFireRef.current = now;
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const projectiles = projectilesRef.current;
      const explosions = explosionsRef.current;

      // Update and draw projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];

        if (!p.active) {
          projectiles.splice(i, 1);
          continue;
        }

        // Move projectile
        p.x += p.vx;
        p.y += p.vy;

        // Check bounds - remove if off screen
        if (
          p.x < -50 ||
          p.x > canvas.width + 50 ||
          p.y < -50 ||
          p.y > canvas.height + 50
        ) {
          p.active = false;
          projectiles.splice(i, 1);
          continue;
        }

        // Create explosion randomly in flight (simulating mid-air hits)
        if (Math.random() < 0.02) {
          createExplosion(p.x, p.y);
          p.active = false;
          projectiles.splice(i, 1);
          continue;
        }

        // Draw projectile (bolter round style)
        ctx.save();
        ctx.translate(p.x, p.y);

        // Calculate angle based on velocity
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        // Trail
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-40, 0);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.stroke();

        // Shell body
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1;
        ctx.fill();

        // Glow effect
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
      }

      // Update and draw explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];

        if (!e.active) {
          explosions.splice(i, 1);
          continue;
        }

        e.frame++;

        if (e.frame >= e.maxFrames) {
          e.active = false;
          explosions.splice(i, 1);
          continue;
        }

        const progress = e.frame / e.maxFrames;
        const alpha = 1 - progress;
        const maxRadius = e.size;

        // Primary explosion ring
        ctx.beginPath();
        ctx.arc(e.x, e.y, maxRadius * progress, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Secondary ring (delayed)
        if (e.frame > 5) {
          const progress2 = (e.frame - 5) / (e.maxFrames - 5);
          ctx.beginPath();
          ctx.arc(e.x, e.y, maxRadius * progress2 * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 200, 50, ${alpha * 0.7})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Particles
        const particleCount = 12;
        for (let j = 0; j < particleCount; j++) {
          const angle = (j / particleCount) * Math.PI * 2 + e.frame * 0.15;
          const speed = 0.5 + Math.random() * 0.5;
          const distance = maxRadius * progress * speed * 1.5;
          const px = e.x + Math.cos(angle) * distance;
          const py = e.y + Math.sin(angle) * distance;
          const size = 2 + Math.random() * 2;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = e.frame % 3 === 0
            ? `rgba(255, 200, 100, ${alpha})`
            : e.frame % 3 === 1
            ? `rgba(255, 100, 50, ${alpha})`
            : `rgba(255, 150, 0, ${alpha})`;
          ctx.fill();
        }

        // Center flash (early frames)
        if (e.frame < 8) {
          const flashAlpha = 1 - (e.frame / 8);
          const flashRadius = e.size * (e.frame / 8);
          ctx.beginPath();
          ctx.arc(e.x, e.y, flashRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.9})`;
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        animate();
        fireRandom();
      });
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
