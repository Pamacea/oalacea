import { notFound } from "next/navigation"
import { getProjectBySlugForServer } from "@/actions/projects-server"
import { ProjectTemplate } from "@/features/portfolio/components/ProjectTemplate"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlugForServer(slug)

  if (!project) {
    notFound()
  }

  return (
    <article className="w-full">
      <ProjectTemplate project={project} variant="page" />
    </article>
  )
}
