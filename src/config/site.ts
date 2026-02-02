export const siteConfig = {
  name: "Oalacea",
  title: "Oalacea - Enterprise Portfolio & Blog",
  description: "Enterprise portfolio, blog & platform showcasing projects, skills, and insights.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og.jpg",
  links: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "oalacea@oalacea.fr",
  },
  author: {
    name: "Oalacea Team",
    email: "oalacea@oalacea.fr",
  },
}

export type SiteConfig = typeof siteConfig
