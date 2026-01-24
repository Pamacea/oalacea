import type { ProjectListItem } from "@/types"
import { Card } from "@/components/ui/card"

interface ProjectCardProps {
  project: ProjectListItem
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">{project.title}</h2>
      <p className="mt-4 text-muted-foreground">{project.description}</p>
      {project.technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-secondary px-3 py-1 text-xs"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
