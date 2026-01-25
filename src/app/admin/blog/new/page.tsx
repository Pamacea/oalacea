import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { getAllCategories } from '@/actions/blog';
import { BlogPostForm } from '../BlogPostForm';

export default async function NewBlogPostPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nouvel article</h1>
        <p className="text-slate-400">Créez un nouvel article de blog</p>
      </div>
      <BlogPostForm categories={categories} />
    </div>
  );
}
