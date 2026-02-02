import { getProjectsForServer } from "@/actions/projects-server"
import type { ProjectListItem } from "@/actions/projects"
import { CATEGORY_LABELS } from "@/features/portfolio/constants"
import Link from "next/link"
import Image from "next/image"
import { GlitchText } from "@/components/ui/imperium"
import { BrutalCard } from "@/components/navigation/BrutalBackground"
import { portfolioMetadata } from "@/shared/components/seo/PageMetadata"

export const metadata = portfolioMetadata
export const dynamic = 'force-dynamic'

export default async function ProjetsPage() {
  const projects = await getProjectsForServer()

  if (projects.length === 0) {
    return (
      <div className="w-full max-w-4/5 mx-auto px-4 text-center py-12">
        <div className="inline-block border-2 border-imperium-gold bg-imperium-black-raise px-8 py-6">
          <h1 className="font-display text-4xl uppercase tracking-widest text-imperium-gold mb-4">
            <GlitchText>Forge</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel-dark">
            {'>'} No blueprints found in archives
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4/5 mx-auto px-4">
      <header className="mb-12">
        <div className="inline-block border-2 border-imperium-gold bg-imperium-black-raise px-6 py-4">
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-widest text-imperium-gold">
            <GlitchText>Forge</GlitchText>
          </h1>
          <p className="font-terminal text-imperium-steel mt-2">
            {'>'} Imperial manufactorum output directory
          </p>
        </div>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
    <BrutalCard hovered className="group cursor-pointer">
      <Link href={`/projets/${project.slug}`} className="block">
        {/* Thumbnail */}
        {project.thumbnail && (
          <div className="aspect-video overflow-hidden border-b-2 border-imperium-steel-dark/50 relative">
            <div className="absolute inset-0 bg-imperium-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full h-full" style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent_1px, rgba(212,175,55,0.2)_1px, rgba(212,175,55,0.2)_2px)',
              }} />
            </div>
            <Image
              src={project.thumbnail}
              alt={project.title}
              width={400}
              height={225}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              {/* Category Badge */}
              <span className="inline-flex items-center px-2 py-0.5 font-terminal text-xs font-semibold border border-imperium-gold bg-imperium-gold/20 text-imperium-gold mb-2">
                {CATEGORY_LABELS[project.category.slug] || project.category.name}
              </span>

              {/* Title */}
              <h3 className="font-display text-lg uppercase tracking-wider mb-2">
                <span className="text-imperium-bone group-hover:text-imperium-gold transition-colors">
                  {project.title}
                </span>
              </h3>
            </div>

            {/* Featured Indicator */}
            {project.featured && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-imperium-gold bg-imperium-gold text-imperium-black text-xs font-bold">
                ★
              </div>
            )}
          </div>

          {/* Description */}
          <p className="font-terminal text-sm text-imperium-steel line-clamp-2 mb-4">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 font-terminal text-xs border border-imperium-steel-dark bg-imperium-black text-imperium-steel"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="px-2 py-0.5 font-terminal text-xs border border-imperium-steel-dark bg-imperium-black text-imperium-steel-dark">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-imperium-steel-dark/50">
            <div className="font-terminal text-sm text-imperium-crimson uppercase flex items-center gap-2">
              <span>{'>'}</span>
              <span className="group-hover:text-imperium-gold transition-colors">Blueprint</span>
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span className="font-terminal text-xs text-imperium-steel-dark">
              {project.year}
            </span>
          </div>
        </div>

        {/* Glitch line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-imperium-gold to-transparent opacity-50" />
      </Link>
    </BrutalCard>
  )
}
