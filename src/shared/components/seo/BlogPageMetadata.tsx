import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export function blogPageMetadata(): Metadata {
  return {
    title: "Blog",
    description: "Articles sur le développement web, React, Next.js, Three.js et la création 3D interactive.",
    openGraph: {
      title: "Blog - Oalacea",
      description: "Articles sur le développement web, React, Next.js, Three.js et la création 3D.",
      url: `${siteConfig.url}/blog`,
      type: "website",
    },
    alternates: {
      canonical: `${siteConfig.url}/blog`,
    },
  }
}
