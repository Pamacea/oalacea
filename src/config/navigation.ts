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
    title: "Portfolio",
    href: "/portfolio",
  },
  {
    title: "Blog",
    href: "/blog",
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
      { title: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    title: "Content",
    items: [
      { title: "Blog", href: "/blog" },
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
