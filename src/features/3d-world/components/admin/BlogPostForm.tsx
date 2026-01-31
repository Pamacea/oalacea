'use client';

import { useState, useEffect, useRef } from 'react';
import { getPostBySlug } from '@/actions/blog';
import { getAllCategories } from '@/actions/blog';
import { useCreatePost, useUpdatePost } from '@/features/blog/queries';
import { ArrowLeft, Save, FileText, Upload, X as XIcon, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useInWorldAdminStore } from '@/features/admin/store';

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  coverImage: string;
  tags: string;
  featured: boolean;
};

export function BlogPostForm({ postId, world }: { postId?: string; world: 'dev' | 'art' }) {
  const { setView } = useInWorldAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme classes - conditional for Tailwind JIT
  const isDev = world === 'dev';

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    coverImage: '',
    tags: '',
    featured: false,
  });

  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [isLoading, setIsLoading] = useState(!!postId);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Load categories and post data
  useEffect(() => {
    async function loadData() {
      // If no postId (creating new post), we're done loading
      if (!postId) {
        setIsLoading(false);
        return;
      }

      try {
        // Load categories in parallel with post
        const [cats, post] = await Promise.all([
          getAllCategories().catch(() => []),
          getPostBySlug(postId),
        ]);

        if (cats) {
          setCategories(cats);
        }

        if (post) {
          // Find category id from loaded categories by matching slug
          const catId = cats?.find((c) => c.slug === post.category?.slug)?.id || '';
          setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content || '',
            categoryId: catId,
            coverImage: post.coverImage || '',
            tags: post.tags?.join(', ') || '',
            featured: post.featured,
          });
        }
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [postId]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: postId ? prev.slug : generateSlug(newTitle),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB for reasonable base64)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop grosse. Maximum 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a canvas to compress the image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 50));
        }
      };

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.8 quality (smaller than PNG)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        setFormData((prev) => ({ ...prev, coverImage: compressedDataUrl }));
        setUploadProgress(100);
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 500);
      };

      img.onerror = () => {
        console.error('Failed to load image');
        setIsUploading(false);
        setUploadProgress(0);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    setSaveStatus('idle');
    const data = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      excerpt: formData.excerpt || undefined,
      content: formData.content,
      categoryId: formData.categoryId || undefined,
      coverImage: formData.coverImage || undefined,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured: formData.featured,
      published: publish,
    };

    try {
      if (postId) {
        await updateMutation.mutateAsync({ slug: formData.slug, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setSaveStatus('success');
      setView('posts');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 text-sm">Chargement...</div>
      </div>
    );
  }

  const titleClass = 'text-zinc-100';
  const labelClass = 'text-zinc-300';
  const labelDimClass = 'text-zinc-600';
  const inputBorder = 'border-zinc-700 focus:border-zinc-600';
  const buttonPrimary = 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100';
  const buttonSecondary = 'border-zinc-700 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400';
  const checkboxBorder = 'border-zinc-700';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('posts')}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${buttonSecondary}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <h2 className={`text-lg font-bold ${titleClass}`}>
          {postId ? 'Modifier l&apos;article' : 'Nouvel article'}
        </h2>
        <div className="w-6" />
      </div>

      {/* Cover Image Preview */}
      {formData.coverImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/10">
          <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
            className="absolute top-3 right-3 rounded-lg bg-black/50 p-2 text-zinc-100 hover:bg-black/70 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Title and Slug */}
      <div className="space-y-2">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleTitleChange}
          required
          placeholder="Titre de l'article..."
          className={`w-full rounded-xl border ${inputBorder} bg-zinc-900 px-4 py-3 text-xl font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors`}
        />
        <p className={`text-xs font-mono pl-1 ${labelDimClass}`}>
          /{formData.slug || 'slug-auto-genere'}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Main content */}
        <div className="col-span-2 space-y-4">
          {/* Excerpt */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${labelClass}`}>Extrait</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="Un bref résumé pour l'accroche..."
              className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none resize-none`}
            />
          </div>

          {/* Content */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${labelClass}`}>Contenu *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={12}
              required
              placeholder="# Titre du article

Écrivez votre contenu ici en **markdown**..."
              className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none resize-y font-mono leading-relaxed`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${labelClass}`}>Catégorie</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none`}
            >
              <option value="">Aucune catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-zinc-500">Aucune catégorie disponible</p>
            )}
          </div>
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-4">
          {/* Cover Image Upload */}
          <div className={`rounded-xl border ${inputBorder} bg-zinc-900 p-4`}>
            <h3 className={`mb-3 text-sm font-semibold ${labelClass}`}>Image de couverture</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`w-full rounded-lg border-2 border-dashed ${inputBorder} py-4 text-center transition-colors hover:bg-white/5 disabled:opacity-50`}
            >
              {isUploading ? (
                <div className="space-y-2">
                  <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${isDev ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-zinc-500">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-zinc-500" />
                  <p className="text-sm text-zinc-400">Cliquez pour uploader</p>
                  <p className="text-xs text-zinc-600">ou collez une URL ci-dessous</p>
                </div>
              )}
            </button>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="Ou collez une URL d'image..."
              className={`mt-3 w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:outline-none`}
            />
          </div>

          {/* Tags */}
          <div className={`rounded-xl border ${inputBorder} bg-zinc-900 p-4`}>
            <h3 className={`mb-3 text-sm font-semibold ${labelClass}`}>Tags</h3>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, nextjs, typescript"
              className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none`}
            />
            <p className="mt-1 text-xs text-zinc-500">Séparés par des virgules</p>
          </div>

          {/* Options */}
          <div className={`rounded-xl border ${inputBorder} bg-zinc-900 p-4`}>
            <h3 className={`mb-3 text-sm font-semibold ${labelClass}`}>Options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className={`h-4 w-4 rounded ${checkboxBorder} bg-zinc-900 focus:ring-zinc-500`}
              />
              <span className="text-sm text-zinc-100">Article à la une</span>
            </label>
          </div>

          {/* Preview Link */}
          {formData.slug && (
            <div className={`rounded-xl border ${inputBorder} bg-zinc-900 p-4`}>
              <a
                href={`/blog/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm ${titleClass} hover:opacity-80 transition-colors`}
              >
                <Eye className="h-4 w-4" />
                Prévisualiser l&apos;article
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center justify-between border-t ${inputBorder} pt-6`}>
        <button
          type="button"
          onClick={() => setView('posts')}
          className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5"
        >
          Annuler
        </button>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Enregistré
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              Erreur
            </span>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isPending || !formData.title || !formData.content}
              className={`rounded-lg border-2 ${buttonSecondary} px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Enregistrement...' : 'Brouillon'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isPending || !formData.title || !formData.content}
              className={`rounded-lg ${buttonPrimary} px-6 py-3 text-sm font-medium text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              <FileText className="h-4 w-4" />
              {isPending ? 'Publication...' : postId ? 'Mettre à jour' : 'Publier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
