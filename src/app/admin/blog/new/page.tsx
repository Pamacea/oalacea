import { BlogForm } from '@/features/admin/components/blog/BlogForm';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  return <BlogForm />;
}
