import { JsonLd } from "./JsonLd"
import { siteConfig } from "@/config/site"

export function PersonSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    jobTitle: siteConfig.author.jobTitle,
    email: siteConfig.links.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: siteConfig.author.location,
    },
    url: siteConfig.url,
    sameAs: [
      siteConfig.links.github,
      siteConfig.links.linkedin,
      siteConfig.links.twitter,
    ],
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "Three.js",
      "Web Development",
      "3D Web",
      "Creative Coding",
    ],
  }

  return <JsonLd data={data} />
}
