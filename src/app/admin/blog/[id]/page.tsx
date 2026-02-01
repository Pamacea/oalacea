import { BlogForm } from '@/features/admin/components/blog/BlogForm';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { getPostById } from '@/actions/blog';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    redirect('/admin/blog');
  }

  return <BlogForm postId={post.id} />;
}
