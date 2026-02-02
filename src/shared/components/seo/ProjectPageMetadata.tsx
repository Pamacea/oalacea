import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export function createProjectMetadata({
  title,
  description,
  slug,
}: {
  title: string
  description: string
  slug: string
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/portfolio/${slug}`,
      images: [
        {
          url: `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}`,
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
      description,
      creator: siteConfig.seo.twitterCreator,
    },
    alternates: {
      canonical: `${siteConfig.url}/portfolio/${slug}`,
    },
  }
}
