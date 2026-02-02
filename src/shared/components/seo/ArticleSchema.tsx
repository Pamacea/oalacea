import { JsonLd } from "./JsonLd"
import { siteConfig } from "@/config/site"

export interface ArticleSchemaProps {
  title: string
  description?: string
  image?: string
  datePublished: string
  dateModified?: string
  author?: string
  category?: string
  tags?: string[]
}

export function ArticleSchema({
  title,
  description,
  image = `${siteConfig.url}${siteConfig.ogImage}`,
  datePublished,
  dateModified,
  author = siteConfig.author.name,
  category,
  tags,
}: ArticleSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description || title,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteConfig.url,
    },
    ...(category && { articleSection: category }),
    ...(tags && { keywords: tags.join(", ") }),
  }

  return <JsonLd data={data} />
}
