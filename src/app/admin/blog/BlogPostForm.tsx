'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, updatePost } from '@/actions/blog';
import { getAllCategories } from '@/actions/blog';
import { X, Eye, EyeOff } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { CollaborationStatus } from '@/components/admin/CollaborationStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

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

const htmlToMarkdown = (html: string): string => {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    })
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let i = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${i++}. $1\n`) + '\n';
    })
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

  const [showPreview, setShowPreview] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.url;
  };

  const handleSelectMedia = (item: any) => {
    setFormData((prev) => ({ ...prev, coverImage: item.url }));
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
      <div className="grid gap-6 lg:grid-cols-4">
        {post && (
          <div className="lg:col-span-4">
            <CollaborationStatus
              entityType="Post"
              entityId={post.id}
              title={post.title}
            />
          </div>
        )}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
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
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-zinc-700"
                placeholder="My interesting article"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-zinc-700 font-mono text-sm"
                placeholder="my-interesting-article"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none resize-none"
                placeholder="A brief summary of the article..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Content</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="h-7"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </>
                  )}
                </Button>
              </div>

              {showPreview ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                  {formData.content && (
                    <div className="mt-8 pt-8 border-t border-zinc-800">
                      <h4 className="text-sm font-semibold text-zinc-400 mb-2">
                        Markdown Preview
                      </h4>
                      <pre className="text-xs bg-zinc-950 p-4 rounded-lg overflow-x-auto">
                        {htmlToMarkdown(formData.content)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, content: value }))
                  }
                  placeholder="Write your article content here..."
                  onImageUpload={handleUploadImage}
                />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="font-semibold text-zinc-100">Publication</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="published" className="cursor-pointer">
                Published
              </Label>
              <Switch
                id="published"
                name="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, published: checked }))
                }
              />
            </div>

            <div>
              <Label htmlFor="publishDate">Publication Date</Label>
              <Input
                id="publishDate"
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-zinc-700"
              />
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 focus:border-zinc-700 focus:outline-none"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured" className="cursor-pointer">
                Featured article
              </Label>
              <Switch
                id="featured"
                name="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, featured: checked }))
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">Media</h3>
              <MediaLibrary
                open={mediaLibraryOpen}
                onOpenChange={setMediaLibraryOpen}
                onSelect={handleSelectMedia}
                trigger={
                  <Button type="button" variant="ghost" size="sm" className="h-7">
                    Browse
                  </Button>
                }
              />
            </div>

            <div>
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-zinc-700"
                placeholder="https://..."
              />
            </div>

            {formData.coverImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
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
                  className="absolute top-2 right-2 rounded bg-black/50 p-1 text-zinc-100 hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-zinc-700"
                placeholder="react, nextjs, typescript"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Separated by commas
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="font-semibold text-zinc-100">SEO</h3>

            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-zinc-700 text-sm"
                placeholder="SEO title (optional)"
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none resize-none"
                placeholder="Description for search engines..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
        >
          {isPending
            ? 'Saving...'
            : post
            ? 'Update'
            : 'Publish'}
        </Button>
      </div>
    </form>
  );
}
