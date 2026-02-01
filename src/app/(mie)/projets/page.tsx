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
          <h1 className="font-display text-3xl uppercase tracking-wider text-imperium-crimson">
            [ Projects ]
          </h1>
          <p className="mt-4 font-terminal text-imperium-steel-dark">
            {'>'} Aucun projet disponible pour le moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl uppercase tracking-wider text-imperium-crimson">
          [ Projects ]
        </h1>
        <p className="mt-4 font-terminal text-imperium-steel">
          {'>'} Découvrez mes réalisations dans le domaine du développement web, du design interactif et plus encore.
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
    <article className="group relative overflow-hidden rounded-none border-2 border-imperium-steel-dark bg-imperium-black transition-all hover:border-imperium-gold hover:shadow-[8px_8px_0_rgba(184,166,70,0.3)]">
      {/* Thumbnail */}
      {project.thumbnail && (
        <Link href={`/projets/${project.slug}`}>
          <div className="aspect-video overflow-hidden border-b-2 border-imperium-steel-dark">
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
            <span className="inline-flex items-center px-2 py-1 font-terminal text-xs font-semibold rounded-none border-2 border-imperium-steel bg-imperium-iron text-imperium-steel mb-2">
              {CATEGORY_LABELS[project.category.slug] || project.category.name}
            </span>

            {/* Title */}
            <h3 className="font-display text-lg uppercase tracking-wider">
              <Link
                href={`/projets/${project.slug}`}
                className="hover:text-imperium-gold transition-colors text-imperium-bone"
              >
                {project.title}
              </Link>
            </h3>
          </div>

          {/* Featured Indicator */}
          {project.featured && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border-2 border-imperium-gold bg-imperium-gold text-imperium-black shadow-[4px_4px_0_rgba(184,166,70,0.3)]">
              <Star className="h-4 w-4 fill-current" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 font-terminal text-sm text-imperium-steel line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 font-terminal text-xs rounded-none border-2 border-imperium-steel bg-imperium-iron text-imperium-steel"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="px-2 py-1 font-terminal text-xs rounded-none border-2 border-imperium-steel bg-imperium-black text-imperium-steel-dark">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/projets/${project.slug}`}
            className="font-terminal text-sm font-medium text-imperium-steel hover:text-imperium-crimson transition-colors uppercase"
          >
            {'>'} View Project
          </Link>
          <div className="flex-1" />
        </div>

        {/* Year */}
        <div className="mt-3 font-terminal text-xs text-imperium-steel-dark">
          {project.year}
        </div>
      </div>
    </article>
  )
}
