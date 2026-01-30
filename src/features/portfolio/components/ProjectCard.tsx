'use client'

import Link from 'next/link'
import { ExternalLink, Github, Star } from 'lucide-react'
import { useWorldTheme } from '@/components/theme'
import type { Project } from '@/generated/prisma/client'

interface ProjectCardProps {
  project: Project & { worldPosition?: unknown }
}

const categoryLabels: Record<string, string> = {
  WEB: 'Web',
  MOBILE: 'Mobile',
  THREE_D: '3D',
  AI: 'IA',
  OTHER: 'Autre',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { colors, isDark } = useWorldTheme()

  return (
    <article
      className="group relative overflow-hidden rounded-xl transition-all"
      style={{
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
      }}
    >
      {/* Thumbnail */}
      {project.thumbnail && (
        <div className="aspect-video overflow-hidden">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Category Badge */}
            <span
              className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded mb-2"
              style={{
                backgroundColor: isDark ? `${colors.secondary}20` : `${colors.secondary}30`,
                color: colors.secondary,
              }}
            >
              {categoryLabels[project.category] || project.category}
            </span>

            {/* Title */}
            <h3
              className="text-lg sm:text-xl font-bold transition-colors"
              style={{ color: colors.text.primary }}
            >
              <Link
                href={`/portfolio/${project.slug}`}
                className="hover:underline"
                style={{ textDecorationColor: colors.text.primary }}
              >
                {project.title}
              </Link>
            </h3>
          </div>

          {/* Featured Indicator */}
          {project.featured && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.text.secondary,
                boxShadow: `0 4px 12px ${colors.text.secondary}40`,
              }}
            >
              <Star className="h-4 w-4" fill={isDark ? '#000' : '#fff'} style={{ color: isDark ? '#000' : '#fff' }} />
            </div>
          )}
        </div>

        {/* Description */}
        <p
          className="mt-3 text-sm line-clamp-2"
          style={{ color: colors.text.secondary }}
        >
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: colors.border,
                  color: colors.text.muted,
                }}
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: colors.border,
                  color: colors.text.muted,
                }}
              >
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/portfolio/${project.slug}`}
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: colors.text.secondary }}
          >
            Voir le projet
          </Link>
          <div className="flex-1" />
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded transition-colors hover:opacity-80"
              style={{ color: colors.text.muted }}
              aria-label="Voir sur GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded transition-colors hover:opacity-80"
              style={{ color: colors.text.muted }}
              aria-label="Voir le site en ligne"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Year */}
        <div
          className="mt-3 text-xs"
          style={{ color: colors.text.muted }}
        >
          {project.year}
        </div>
      </div>
    </article>
  )
}
