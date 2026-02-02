import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ]

  try {
    const { prisma: prismaClient } = await import("@/lib/prisma")

    const [posts, projects] = await Promise.all([
      prismaClient.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prismaClient.project.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ])

    const blogRoutes: MetadataRoute.Sitemap = posts.map((post: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    const projectRoutes: MetadataRoute.Sitemap = projects.map((project: { slug: string; updatedAt: Date }) => ({
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))

    return [...staticRoutes, ...blogRoutes, ...projectRoutes]
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error)
    return staticRoutes
  }
}
