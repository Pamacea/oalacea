import { ProjectCard } from './ProjectCard';
import type { Project } from '@/generated/prisma/client';

interface ProjectGridProps {
  projects: (Project & { worldPosition?: any })[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl p-8 sm:p-12 text-center border border-dashed">
        <p className="text-muted-foreground">Aucun projet disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
