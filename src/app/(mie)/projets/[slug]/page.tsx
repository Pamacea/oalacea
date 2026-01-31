import { notFound } from "next/navigation"
import Link from "next/link"
import { ExternalLink, Github, ArrowLeft } from "lucide-react"
import { getProjectBySlug } from "@/actions/projects"
import { CATEGORY_LABELS } from "@/features/portfolio/constants"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="container py-12">
      <article className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/projets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary mb-4">
            {CATEGORY_LABELS[project.category] || project.category}
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-4 text-lg text-muted-foreground">
              {project.description}
            </p>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            Année: {project.year}
          </div>
        </header>

        {/* Thumbnail */}
        {project.thumbnail && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Long Description */}
        {project.longDescription && (
          <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
            <p>{project.longDescription}</p>
          </div>
        )}

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Technologies utilisées</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 pt-8 border-t">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <Github className="h-4 w-4" />
              Code source
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Voir en ligne
            </a>
          )}
        </div>
      </article>
    </div>
  )
}
