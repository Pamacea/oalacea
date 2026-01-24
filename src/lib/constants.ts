export const APP_NAME = "Oalacea"

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

export const BLOG = {
  POSTS_PER_PAGE: 10,
  EXCERPT_LENGTH: 200,
  RECENT_POSTS_COUNT: 5,
} as const

export const PORTFOLIO = {
  PROJECTS_PER_PAGE: 9,
  FEATURED_COUNT: 3,
} as const

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  PORTFOLIO: "/portfolio",
  BLOG: "/blog",
  CONTACT: "/contact",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN: "/admin",
} as const
