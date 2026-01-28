import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { getAllCategories } from '@/actions/blog';
import { BlogPostForm } from '../BlogPostForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewBlogPostPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const categories = await getAllCategories();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100">Nouvel article</h1>
        <p className="text-zinc-500 text-sm mt-1">Créez un nouvel article de blog</p>
      </div>
      <BlogPostForm categories={categories} />
    </div>
  );
}
