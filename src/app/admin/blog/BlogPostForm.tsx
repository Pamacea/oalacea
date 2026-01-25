'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, updatePost } from '@/actions/blog';
import { getAllCategories } from '@/actions/blog';
import { Upload, X } from 'lucide-react';

interface BlogPostFormProps {
  post?: any;
  categories: (any & { postCount: number })[];
}

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  coverImage: string;
  tags: string;
  featured: boolean;
  publishDate: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
};

export function BlogPostForm({ post, categories }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<FormData>({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    categoryId: post?.categoryId || '',
    coverImage: post?.coverImage || '',
    tags: post?.tags?.join(', ') || '',
    featured: post?.featured || false,
    publishDate: post?.publishDate
      ? new Date(post.publishDate).toISOString().split('T')[0]
      : '',
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
    published: post?.published || false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        categoryId: formData.categoryId || undefined,
        coverImage: formData.coverImage || undefined,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        featured: formData.featured,
        publishDate: formData.publishDate || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        published: formData.published,
      };

      if (post) {
        await updatePost(post.slug, data);
      } else {
        await createPost(data);
      }
      router.push('/admin/blog');
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Titre
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => {
                  handleChange(e);
                  if (!post) {
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }));
                  }
                }}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                placeholder="Mon article intéressant"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                placeholder="mon-article-interessant"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Extrait
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none resize-none"
                placeholder="Un bref résumé de l'article..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Contenu
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none resize-y font-mono text-sm"
                placeholder="# Mon article

Write your content here..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-4">
            <h3 className="font-semibold text-white">Publication</h3>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Statut
              </label>
              <select
                name="published"
                value={formData.published ? 'true' : 'false'}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="false">Brouillon</option>
                <option value="true">Publié</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Date de publication
              </label>
              <input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Catégorie
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="">Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/10 bg-slate-900/50 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-white">Article à la une</span>
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-4">
            <h3 className="font-semibold text-white">Médias</h3>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Image de couverture
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                placeholder="https://..."
              />
              {formData.coverImage && (
                <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, coverImage: '' }))
                    }
                    className="absolute top-2 right-2 rounded bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                placeholder="react, nextjs, typescript"
              />
              <p className="mt-1 text-xs text-slate-500">
                Séparés par des virgules
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-4">
            <h3 className="font-semibold text-white">SEO</h3>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
                placeholder="Titre SEO (optionnel)"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none resize-none"
                placeholder="Description pour les moteurs de recherche..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? 'Enregistrement...'
            : post
            ? 'Mettre à jour'
            : 'Publier'}
        </button>
      </div>
    </form>
  );
}
