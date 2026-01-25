import { redirect, notFound } from 'next/navigation';
import { auth } from '@/core/auth';
import { getProjectById } from '@/actions/projects';
import { ProjectForm } from '../ProjectForm';

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Modifier le projet</h1>
        <p className="text-slate-400">{project.title}</p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
