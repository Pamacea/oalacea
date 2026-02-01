import { ProjectForm } from '@/features/admin/components/projects/ProjectForm';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  return <ProjectForm />;
}
