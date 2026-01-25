import { redirect, notFound } from 'next/navigation';
import { auth } from '@/core/auth';
import { getAllCategories } from '@/actions/blog';
import { getPostBySlug } from '@/actions/blog';
import { BlogPostForm } from '../BlogPostForm';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Modifier l'article</h1>
        <p className="text-slate-400">{post.title}</p>
      </div>
      <BlogPostForm post={post} categories={categories} />
    </div>
  );
}
