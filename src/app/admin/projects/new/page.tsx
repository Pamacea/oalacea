import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { ProjectForm } from '../ProjectForm';

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nouveau projet</h1>
        <p className="text-slate-400">Ajoutez un projet à votre portfolio</p>
      </div>
      <ProjectForm />
    </div>
  );
}
