'use client'

import Link from 'next/link'
import { ExternalLink, Github, Star } from 'lucide-react'
import { CATEGORY_LABELS } from '@/features/portfolio/constants'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProjectCardProps {
  project: {
    id: string
    slug: string
    title: string
    description: string
    thumbnail: string | null
    year: number
    techStack: string[]
    githubUrl: string | null
    liveUrl: string | null
    featured: boolean
    category: Category
    worldPosition?: unknown
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-none border-2 border-imperium-steel-dark bg-imperium-black transition-all hover:border-imperium-gold hover:shadow-[4px_4px_0_rgba(184,166,70,0.3)]">
      {/* Thumbnail */}
      {project.thumbnail && (
        <div className="aspect-video overflow-hidden border-b-2 border-imperium-steel-dark">
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
            <span className="inline-flex items-center px-3 py-1 text-xs font-display uppercase tracking-wider rounded-none bg-imperium-gold text-imperium-black border-2 border-imperium-gold-dark mb-2">
              {CATEGORY_LABELS[project.category.slug] || project.category.name}
            </span>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-display uppercase tracking-wider text-imperium-bone">
              <Link
                href={`/portfolio/${project.slug}`}
                className="hover:text-imperium-gold transition-colors"
              >
                {project.title}
              </Link>
            </h3>
          </div>

          {/* Featured Indicator */}
          {project.featured && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-imperium-gold border-2 border-imperium-gold-dark">
              <Star className="h-4 w-4 text-imperium-black" fill="currentColor" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-sm font-terminal text-imperium-steel line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs font-terminal uppercase rounded-none bg-imperium-iron text-imperium-steel border border-imperium-iron-dark"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="px-2 py-1 text-xs font-terminal uppercase rounded-none bg-imperium-iron text-imperium-steel border border-imperium-iron-dark">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/portfolio/${project.slug}`}
            className="text-sm font-display uppercase text-imperium-gold hover:text-imperium-gold-bright transition-colors"
          >
            Voir le projet
          </Link>
          <div className="flex-1" />
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-none border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson transition-colors"
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
              className="p-2 rounded-none border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-crimson hover:text-imperium-crimson transition-colors"
              aria-label="Voir le site en ligne"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Year */}
        <div className="mt-3 text-xs font-terminal text-imperium-steel-dark">
          {project.year}
        </div>
      </div>
    </article>
  )
}
