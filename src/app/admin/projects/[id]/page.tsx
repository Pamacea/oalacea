import { redirect, notFound } from 'next/navigation';
import { auth } from '@/core/auth';
import { getProjectById } from '@/actions/projects';
import { ProjectForm } from '../ProjectForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100">Modifier le projet</h1>
        <p className="text-zinc-500 text-sm mt-1">{project.title}</p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
