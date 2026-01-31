/**
 * BRUTAL CARD - La carte minérale cassée
 * Fragments qui dépassent, scanlines, glitch, grunge
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "crimson" | "gold" | "rusted" | "corrupted"
  children: React.ReactNode
  intensity?: "subtle" | "medium" | "severe"
}

const variantStyles = {
  crimson: "border-imperium-crimson bg-imperium-charcoal",
  gold: "border-imperium-gold bg-imperium-charcoal",
  rusted: "border-imperium-rust bg-imperium-charcoal",
  corrupted: "border-imperium-teal bg-imperium-black-deep",
}

const fragmentColors = {
  crimson: ["bg-imperium-crimson", "bg-imperium-gold", "bg-imperium-metal"],
  gold: ["bg-imperium-gold", "bg-imperium-crimson", "bg-imperium-teal"],
  rusted: ["bg-imperium-rust", "bg-imperium-earth", "bg-imperium-grime"],
  corrupted: ["bg-imperium-teal", "bg-imperium-crimson", "bg-imperium-metal"],
}

export function BrutalCard({
  variant = "crimson",
  intensity = "medium",
  children,
  className,
  ...props
}: BrutalCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const fragments = fragmentColors[variant]

  return (
    <motion.div
      className={cn(
        "relative border-2 p-6 overflow-hidden",
        variantStyles[variant],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* === NOISE TEXTURE === */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
           }} />

      {/* === SCANLINES === */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
           style={{
             backgroundImage: `linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.4) 50%)`,
             backgroundSize: "100% 3px",
           }} />

      {/* === FRAGMENTS - Particules qui dépassent === */}
      <AnimatePresence>
        {isHovered && intensity !== "subtle" && (
          <>
            {/* Top-right fragment */}
            <motion.div
              className={cn("absolute w-16 h-3", fragments[0])}
              style={{ top: "-12px", right: "-12px" }}
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ x: [0, 20, 0], y: [0, -10, 0], rotate: [0, 15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Bottom-left fragment */}
            <motion.div
              className={cn("absolute w-4 h-16", fragments[1])}
              style={{ bottom: "-8px", left: "-8px" }}
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ x: [0, -15, 0], y: [0, 20, 0], rotate: [0, -20, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />

            {/* Random floating debris */}
            {Array.from({ length: intensity === "severe" ? 8 : 4 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn("absolute w-1 h-1", fragments[i % fragments.length])}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ opacity: 0 }}
                animate={{
                  y: [0, 100, 200],
                  x: [0, (Math.random() - 0.5) * 50],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 360],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  delay: Math.random() * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1 + Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* === GLITCH OVERLAY === */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            clipPath: [
              "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              "polygon(5% 5%, 95% 0%, 100% 95%, 0% 100%)",
              "polygon(0% 0%, 100% 5%, 95% 100%, 5% 95%)",
              "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ],
          }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.5 }}
          style={{
            background: variant === "corrupted"
              ? "rgba(78, 205, 196, 0.2)"
              : "rgba(154, 17, 21, 0.2)",
          }}
        />
      )}

      {/* === CONTENT === */}
      <div className="relative z-10">
        {children}
      </div>

      {/* === CORNER ACCENTS === */}
      <div className={cn(
        "absolute top-0 left-0 w-8 h-1",
        variant === "crimson" ? "bg-imperium-crimson" :
        variant === "gold" ? "bg-imperium-gold" :
        variant === "rusted" ? "bg-imperium-rust" : "bg-imperium-teal"
      )} />

      <div className={cn(
        "absolute bottom-0 right-0 w-1 h-8",
        variant === "crimson" ? "bg-imperium-crimson" :
        variant === "gold" ? "bg-imperium-gold" :
        variant === "rusted" ? "bg-imperium-rust" : "bg-imperium-teal"
      )} />
    </motion.div>
  )
}

/**
 * BrutalCardHeader - Header avec glitch effect
 */
export function BrutalCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b-2 border-imperium-metal-dark pb-4 mb-4 relative", className)}
      {...props}
    >
      {/* Glitch line decoration */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-imperium-crimson/50" />
      {children}
    </div>
  )
}

/**
 * BrutalCardTitle - Titre criard
 */
export function BrutalCardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xl font-bold uppercase tracking-[0.15em] text-imperium-gold",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

/**
 * BrutalCardContent - Content avec typo monospace
 */
export function BrutalCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("font-mono text-sm text-imperium-metal leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * BrutalCardFooter - Footer avec bordure supérieure
 */
export function BrutalCardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t-2 border-imperium-metal-dark pt-4 mt-4 flex items-center justify-between gap-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}
