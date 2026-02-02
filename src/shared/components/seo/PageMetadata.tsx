import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

interface PageMetadataOptions {
  title: string
  description?: string
  path: string
  image?: string
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
}: PageMetadataOptions): Metadata {
  const fullImage = image || `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title,
    description: description || siteConfig.description,
    openGraph: {
      title,
      description: description || siteConfig.description,
      url: `${siteConfig.url}${path}`,
      type: "website",
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || siteConfig.description,
      images: [fullImage],
      creator: siteConfig.seo.twitterCreator,
    },
    alternates: {
      canonical: `${siteConfig.url}${path}`,
    },
  }
}

// Predefined metadata for common pages
export const homeMetadata = createPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
})

export const aboutMetadata = createPageMetadata({
  title: "À propos",
  description:
    "À propos d'Oalacea, Creative Developer spécialisé en React, Next.js et 3D web.",
  path: "/about",
})

export const portfolioMetadata = createPageMetadata({
  title: "Portfolio",
  description:
    "Découvrez mes projets de développement web, applications interactives et créations 3D.",
  path: "/portfolio",
})

export const blogMetadata = createPageMetadata({
  title: "Blog",
  description:
    "Articles sur le développement web, React, Next.js, Three.js et la création 3D.",
  path: "/blog",
})

export const contactMetadata = createPageMetadata({
  title: "Contact",
  description: "Contactez-moi pour vos projets de développement web.",
  path: "/contact",
})
