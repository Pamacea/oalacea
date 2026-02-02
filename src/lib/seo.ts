import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export interface SeoMetadataProps {
  title: string
  description?: string
  image?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  canonical?: string
  noindex?: boolean
}

export function createMetadata({
  title,
  description = siteConfig.description,
  image = `${siteConfig.url}${siteConfig.ogImage}`,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  tags,
  canonical,
  noindex = false,
}: SeoMetadataProps): Metadata {
  const baseUrl = siteConfig.url

  return {
    title,
    description,
    keywords: siteConfig.seo.keywords,
    authors: authors?.map((name) => ({ name })) || [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    openGraph: {
      type,
      locale: "fr_FR",
      url: canonical,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: siteConfig.name,
      publishedTime,
      modifiedTime,
      authors,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.seo.twitterCreator,
    },
    alternates: {
      canonical: canonical || baseUrl,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export function getCanonicalUrl(path: string): string {
  const baseUrl = siteConfig.url
  return `${baseUrl}${path}`
}
