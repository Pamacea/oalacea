import { ProjectForm } from '@/features/admin/components/projects/ProjectForm';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { getProjectById } from '@/actions/projects';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    redirect('/admin/projects');
  }

  return <ProjectForm projectId={project.id} />;
}
