import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"

/**
 * Mineral Card Component
 * Warhammer 40K inspired card with glitch effects and mineral "breaks"
 *
 * Features:
 * - Absolute positioned divs that "break" the card shape (video game mineral style)
 * - Glitch overlay on hover
 * - Scanlines effect
 * - Accent borders (crimson or gold)
 * - NO border radius - brutalist square shape
 */

export interface MineralCardProps {
  variant?: "crimson" | "gold" | "brutal" | "glitch"
  padding?: "none" | "sm" | "md" | "lg"
  children: React.ReactNode
  showScanlines?: boolean
  className?: string
  id?: string
}

const paddingMap = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

const variantStyles = {
  crimson: "border-imperium-crimson",
  gold: "border-imperium-gold",
  brutal: "border-imperium-crimson border-2",
  glitch: "border-imperium-iron",
}

const accentColors = {
  crimson: "bg-imperium-crimson",
  gold: "bg-imperium-gold",
  brutal: "bg-imperium-crimson",
  glitch: "bg-imperium-maroon",
}

export function MineralCard({
  variant = "crimson",
  padding = "md",
  children,
  showScanlines = true,
  className,
  ...props
}: MineralCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      className={cn(
        "relative bg-imperium-black-raise border-2 overflow-hidden group",
        variantStyles[variant],
        paddingMap[padding],
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* === MINERAL BREAKS - Divs that extend beyond the card === */}

      {/* Top-right mineral break */}
      <div
        className={cn(
          "absolute -top-2 -right-2 w-8 h-8 transition-colors",
          accentColors[variant]
        )}
      />

      {/* Second mineral break - bottom-left */}
      <div
        className={cn(
          "absolute -bottom-1 -left-1 w-4 h-4 transition-colors",
          variant === "gold" ? "bg-imperium-crimson" : "bg-imperium-gold"
        )}
      />

      {/* Third mineral break - asymmetric */}
      {variant === "brutal" && (
        <>
          <div className="absolute top-1/2 -right-3 w-2 h-12 bg-imperium-maroon" />
          <div className="absolute -bottom-2 right-1/3 w-6 h-2 bg-imperium-gold" />
        </>
      )}

      {/* Glitch overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-imperium-crimson/5 opacity-0 pointer-events-none"
        initial={false}
        animate={{
          opacity: [0, 0.1, 0],
        }}
        whileHover={{
          opacity: [0, 0.15, 0.05, 0.12, 0],
          transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }
        }}
      />

      {/* Mouse-following glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radialial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              rgba(220, 20, 60, 0.1),
              transparent 100%
            )
          `,
        }}
      />

      {/* Scanlines overlay */}
      {showScanlines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(18, 16, 16, 0) 50%,
                rgba(0, 0, 0, 0.25) 50%
              ),
              linear-gradient(
                90deg,
                rgba(255, 0, 0, 0.06),
                rgba(0, 255, 0, 0.02),
                rgba(0, 0, 255, 0.06)
              )
            `,
            backgroundSize: "100% 4px, 3px 100%",
          }}
        />
      )}

      {/* Content - above all effects */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Glitch animation on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        whileHover={{
          x: [0, -2, 2, -1, 0],
          y: [0, 2, -2, 1, 0],
          transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }
        }}
      />
    </motion.div>
  )
}

/**
 * MineralCardHeader - Header section with accent border
 */
export function MineralCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b-2 border-imperium-iron pb-4 mb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * MineralCardTitle - Title with bold weight
 */
export function MineralCardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-xl font-bold text-imperium-ivory uppercase tracking-wider", className)} {...props}>
      {children}
    </h3>
  )
}

/**
 * MineralCardDescription - Muted description text
 */
export function MineralCardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-imperium-ivory-muted mt-2", className)} {...props}>
      {children}
    </p>
  )
}

/**
 * MineralCardContent - Main content area
 */
export function MineralCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-imperium-ivory-dim", className)} {...props}>
      {children}
    </div>
  )
}

/**
 * MineralCardFooter - Footer section with top border
 */
export function MineralCardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t-2 border-imperium-iron pt-4 mt-4", className)} {...props}>
      {children}
    </div>
  )
}
