import Link from "next/link"
import { siteConfig } from "@/config/site"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Welcome to {siteConfig.name}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        {siteConfig.description}
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/blog"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Read Blog
        </Link>
        <Link
          href="/portfolio"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          View Portfolio
        </Link>
      </div>
    </div>
  )
}
