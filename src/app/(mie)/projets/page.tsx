import { getProjects } from "@/actions/projects"
import type { ProjectListItem } from "@/actions/projects"
import { CATEGORY_LABELS } from "@/features/portfolio/constants"
import Link from "next/link"
import { Star } from "lucide-react"

export default async function ProjetsPage() {
  const projects = await getProjects()

  if (projects.length === 0) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Projets
          </h1>
          <p className="mt-4 text-muted-foreground">
            Aucun projet disponible pour le moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Projets
        </h1>
        <p className="mt-4 text-muted-foreground">
          Découvrez mes réalisations dans le domaine du développement web, du design interactif et plus encore.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({
  project,
}: {
  project: ProjectListItem
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl transition-all border border-border bg-card hover:border-primary/50">
      {/* Thumbnail */}
      {project.thumbnail && (
        <Link href={`/projets/${project.slug}`}>
          <div className="aspect-video overflow-hidden">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Category Badge */}
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded mb-2 bg-secondary/10 text-secondary">
              {CATEGORY_LABELS[project.category] || project.category}
            </span>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold">
              <Link
                href={`/projets/${project.slug}`}
                className="hover:underline hover:text-primary transition-colors"
              >
                {project.title}
              </Link>
            </h3>
          </div>

          {/* Featured Indicator */}
          {project.featured && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg">
              <Star className="h-4 w-4 fill-current" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/projets/${project.slug}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir le projet
          </Link>
          <div className="flex-1" />
        </div>

        {/* Year */}
        <div className="mt-3 text-xs text-muted-foreground">
          {project.year}
        </div>
      </div>
    </article>
  )
}
