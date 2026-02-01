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
          className="inline-flex items-center gap-2 font-terminal text-sm text-imperium-steel hover:text-imperium-crimson transition-colors mb-8 uppercase"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block px-3 py-1 font-terminal text-xs font-semibold rounded-none border-2 border-imperium-gold bg-imperium-gold/20 text-imperium-gold mb-4">
            {CATEGORY_LABELS[project.category] || project.category}
          </span>
          <h1 className="font-display text-3xl uppercase tracking-[0.2em] text-imperium-bone">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-4 font-terminal text-lg text-imperium-steel">
              {project.description}
            </p>
          )}
          <div className="mt-4 font-terminal text-sm text-imperium-steel-dark">
            {'>'} Year: {project.year}
          </div>
        </header>

        {/* Thumbnail */}
        {project.thumbnail && (
          <div className="mb-8 overflow-hidden rounded-none border-2 border-imperium-steel-dark">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Long Description */}
        {project.longDescription && (
          <div className="prose prose-neutral dark:prose-invert max-w-none mb-8 [&>p]:font-terminal [&>p]:text-imperium-steel [&>h1]:font-display [&>h1]:uppercase [&>h1]:text-imperium-crimson [&>h1]:tracking-wider [&>h2]:font-display [&>h2]:uppercase [&>h2]:tracking-wider [&>h2]:text-imperium-gold [&>strong]:font-display [&>strong]:uppercase [&>strong]:text-imperium-bone [&>a]:text-imperium-crimson [&>a]:hover:text-imperium-gold [&>a]:border-b-2 [&>a]:border-imperium-steel-dark [&>a]:border-dashed [&>a]:pb-0.5 [&>ul]:list-disc [&>ul]:font-terminal [&>ul]:text-imperium-steel">
            <p>{project.longDescription}</p>
          </div>
        )}

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display uppercase tracking-wider text-imperium-gold mb-3">
              {'>'} Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 font-terminal text-sm rounded-none border-2 border-imperium-steel bg-imperium-iron text-imperium-steel"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 pt-8 border-t-2 border-imperium-steel-dark">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm rounded-none border-2 border-imperium-steel bg-imperium-iron hover:border-imperium-crimson hover:bg-imperium-crimson/10 transition-colors"
            >
              <Github className="h-4 w-4" />
              Source Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm rounded-none border-2 border-imperium-crimson bg-imperium-crimson hover:bg-imperium-crimson/90 hover:shadow-[4px_4px_0_rgba(154,17,21,0.4)] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
        </div>
      </article>
    </div>
  )
}
