'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

/**
 * Imperium Navigation Component
 * Floating vertical navigation on the RIGHT side
 *
 * Features:
 * - Fixed position on right side
 * - Vertical icon stack
 * - Square buttons (no border radius)
 * - Crimson glow on active/hover
 * - Minimalist brutalist design
 */

export interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

export interface ImperiumNavProps {
  items: NavItem[]
  className?: string
}

export function ImperiumNav({ items, className }: ImperiumNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 z-50",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isActive}
            >
              <Icon className="size-6" />
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

interface NavLinkProps {
  href: string
  label: string
  isActive?: boolean
  children: React.ReactNode
}

function NavLink({ href, label, isActive = false, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center justify-center",
        "w-14 h-14",
        "border-2 bg-imperium-black-raise",
        "transition-all duration-200",
        // Styles based on state
        isActive
          ? "border-imperium-crimson shadow-[0_0_15px_rgba(220,20,60,0.5)]"
          : "border-imperium-iron hover:border-imperium-crimson/50"
      )}
      aria-label={label}
    >
      {/* Icon */}
      <span
        className={cn(
          "transition-colors",
          isActive ? "text-imperium-crimson" : "text-imperium-ivory-muted group-hover:text-imperium-crimson"
        )}
      >
        {children}
      </span>

      {/* Active indicator - left border glow */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-imperium-crimson"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-imperium-crimson/10 animate-pulse" />
      </div>

      {/* Tooltip on hover */}
      <div
        className={cn(
          "absolute right-full mr-3 px-2 py-1",
          "bg-imperium-crimson text-imperium-ivory text-xs font-bold uppercase tracking-wider",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "pointer-events-none whitespace-nowrap"
        )}
      >
        {label}
      </div>
    </Link>
  )
}

/**
 * Mobile Navigation - Bottom bar for mobile devices
 */
export function ImperiumNavMobile({ items, className }: ImperiumNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "border-t-2 border-imperium-iron bg-imperium-black/95 backdrop-blur",
        "md:hidden",
        className
      )}
    >
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2",
                "transition-colors",
                isActive ? "text-imperium-crimson" : "text-imperium-ivory-muted"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeNavMobile"
                  className="w-full h-0.5 bg-imperium-crimson absolute -top-px"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
