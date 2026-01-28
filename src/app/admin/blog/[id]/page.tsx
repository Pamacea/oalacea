import { redirect, notFound } from 'next/navigation';
import { auth } from '@/core/auth';
import { getAllCategories } from '@/actions/blog';
import { getPostBySlug } from '@/actions/blog';
import { BlogPostForm } from '../BlogPostForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const [post, categories] = await Promise.all([
    getPostBySlug(params.id),
    getAllCategories(),
  ]);

  if (!post) {
    notFound();
  }

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
        <h1 className="text-2xl font-semibold text-zinc-100">Modifier l'article</h1>
        <p className="text-zinc-500 text-sm mt-1">{post.title}</p>
      </div>
      <BlogPostForm post={post} categories={categories} />
    </div>
  );
}
