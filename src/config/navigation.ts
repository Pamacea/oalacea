export const mainNav = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Projets",
    href: "/projets",
  },
  {
    title: "Blog",
    href: "/blogs",
  },
  {
    title: "Contact",
    href: "/contact",
  },
] as const

export const footerNav = [
  {
    title: "Platform",
    items: [
      { title: "Home", href: "/" },
      { title: "About", href: "/about" },
      { title: "Projets", href: "/projets" },
    ],
  },
  {
    title: "Content",
    items: [
      { title: "Blog", href: "/blogs" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
    ],
  },
] as const
