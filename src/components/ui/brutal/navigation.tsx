/**
 * BRUTAL NAV - Navigation chaotique décalée
 * Icônes irrégulières, décalées, qui tremblent
 */

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

export interface BrutalNavProps {
  items: NavItem[]
  className?: string
}

export function BrutalNav({ items, className }: BrutalNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("fixed right-6 top-1/2 -translate-y-1/2 z-50", className)}>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

          // DÉCALAGE ALÉATOIRE pour chaque item
          const offsetClass = index % 3 === 0 ? "translate-x-[-2px] translate-y-[1px] rotate-[-0.5deg]" :
                               index % 3 === 1 ? "translate-x-[1px] translate-y-[-2px] rotate-[0.3deg]" :
                                                 "translate-x-[-1px] translate-y-[2px] rotate-[-0.2deg]"

          return (
            <motion.div
              key={item.href}
              className={cn("relative")}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-14 h-14 border-2 bg-imperium-charcoal transition-colors",
                  offsetClass,
                  isActive
                    ? "border-imperium-crimson shadow-[0_0_20px_rgba(154,17,21,0.5)]"
                    : "border-imperium-metal-dark hover:border-imperium-crimson/50"
                )}
              >
                {/* Icon with glitch effect on hover */}
                <motion.span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-imperium-crimson" : "text-imperium-metal"
                  )}
                  whileHover={{
                    textShadow: [
                      "0 0 transparent",
                      "2px 0 rgba(154, 17, 21, 0.8), -2px 0 rgba(0, 255, 255, 0.8)",
                      "-2px 0 rgba(154, 17, 21, 0.8), 2px 0 rgba(0, 255, 255, 0.8)",
                      "0 0 transparent",
                    ],
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="brutalNavActive"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-imperium-crimson"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </Link>

              {/* Tooltip - appareît avec glitch */}
              <div className="absolute right-full mr-4 px-3 py-1 bg-imperium-crimson text-white text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </div>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
