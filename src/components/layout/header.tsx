"use client"

import Link from "next/link"
import { mainNav } from "@/config/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-imperium-steel-dark bg-imperium-black-deep/95 backdrop-blur supports-[backdrop-filter]:bg-imperium-black-deep/80">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-display text-xl uppercase tracking-[0.2em] text-imperium-crimson">Oalacea</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-display uppercase tracking-wider">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-terminal text-imperium-steel hover:text-imperium-crimson transition-colors border-b-2 border-transparent hover:border-imperium-crimson pb-0.5"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
