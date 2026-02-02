export const siteConfig = {
  name: "Oalacea",
  title: "Oalacea - Creative Developer Portfolio & Blog",
  description: "Portfolio professionnel avec scène 3D interactive. Creative Developer spécialisé en React, Next.js, et 3D web. Découvrez mes projets, articles et insights.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oalacea.fr",
  ogImage: "/api/og",
  logo: "/branding/oalacea.png",
  links: {
    github: "https://github.com/Pamacea",
    linkedin: "https://www.linkedin.com/in/yanis-dessaint/",
    twitter: "https://x.com/oalacea_",
    email: "oalacea@proton.me",
  },
  author: {
    name: "Oalacea",
    email: "oalacea@proton.me",
    jobTitle: "Creative Developer",
    location: "France",
  },
  seo: {
    keywords: [
      "portfolio",
      "creative developer",
      "web developer",
      "React",
      "Next.js",
      "Three.js",
      "3D web",
      "blog",
      "France",
    ],
    twitterCreator: "@oalacea_",
  },
}

export type SiteConfig = typeof siteConfig
