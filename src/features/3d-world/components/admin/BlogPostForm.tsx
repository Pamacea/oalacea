'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, FileText, Upload, X as XIcon, Eye, CheckCircle, AlertCircle, Scroll, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPostBySlug } from '@/actions/blog';
import { getAllCategories } from '@/actions/blog';
import { useCreatePost, useUpdatePost } from '@/features/blog/queries';
import { useInWorldAdminStore } from '@/features/admin/store';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('./markdown-editor').then(mod => ({ default: mod.MarkdownEditor })),
  { ssr: false }
);

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
  const { playHover, playClick } = useUISound();

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
      if (!postId) {
        setIsLoading(false);
        return;
      }

      try {
        const [cats, post] = await Promise.all([
          getAllCategories().catch(() => []),
          getPostBySlug(postId),
        ]);

        if (cats) setCategories(cats);

        if (post) {
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

    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop volumineux. Maximum 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 50));
      };

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = () => {
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
        ctx.drawImage(img, 0, 0, width, height);
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
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-4"
        >
          ⚙
        </motion.div>
        <p className="font-terminal text-imperium-steel">Loading data slate...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
        <motion.button
          onMouseEnter={playHover}
          onClick={() => {
            setView('posts');
            playClick();
          }}
          className="flex items-center gap-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone px-4 py-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          RETURN
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="border-2 border-imperium-gold bg-imperium-gold/10 p-2">
            <Shield className="h-5 w-5 text-imperium-gold" />
          </div>
          <h2 className="font-display text-lg uppercase tracking-wider text-imperium-bone">
            <GlitchText intensity="low">
              {postId ? 'MODIFY ARCHIVE' : 'NEW ARCHIVE ENTRY'}
            </GlitchText>
          </h2>
        </div>
        <div className="w-6" />
      </div>

      {/* Cover Image Preview */}
      {formData.coverImage && (
        <div className="relative aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black">
          <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
          <motion.button
            type="button"
            onMouseEnter={playHover}
            onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
            className="absolute top-3 right-3 border-2 border-imperium-crimson bg-imperium-crimson/10 p-2 text-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-bone transition-all"
          >
            <XIcon className="h-4 w-4" />
          </motion.button>
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
          placeholder="ENTER ARCHIVE TITLE..."
          className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-display text-xl uppercase tracking-wider text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-crimson transition-colors"
        />
        <p className="font-terminal text-xs text-imperium-steel-dark pl-1">
          /{formData.slug || 'SLUG-AUTO-GENERATED'}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Main content */}
        <div className="col-span-2 space-y-4">
          {/* Excerpt */}
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} EXCERPT
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="Brief summary for archive display..."
              className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-crimson resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} CONTENT *
            </label>
            <MarkdownEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="# Archive Title

Write your content here in **markdown**..."
              editable
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} CATEGORY
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-crimson"
            >
              <option value="">-- NO CATEGORY --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 font-terminal text-xs text-imperium-steel-dark">No categories available</p>
            )}
          </div>
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-4">
          {/* Cover Image Upload */}
          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-gold" />
              COVER IMAGE
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <motion.button
              type="button"
              onMouseEnter={playHover}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border-2 border-dashed border-imperium-steel-dark py-6 text-center transition-all hover:border-imperium-steel hover:bg-imperium-steel/10 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="space-y-2">
                  <div className="h-1 w-full bg-imperium-steel overflow-hidden">
                    <div
                      className="h-full bg-imperium-crimson transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="font-terminal text-xs text-imperium-steel">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-imperium-steel" />
                  <p className="font-terminal text-sm text-imperium-steel">CLICK TO UPLOAD</p>
                  <p className="font-terminal text-xs text-imperium-steel-dark">or paste URL below</p>
                </div>
              )}
            </motion.button>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-3 w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-xs text-imperium-bone focus:outline-none focus:border-imperium-crimson"
            />
          </div>

          {/* Tags */}
          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-crimson" />
              TAGS
            </h3>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, nextjs, typescript"
              className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-crimson"
            />
            <p className="mt-1 font-terminal text-xs text-imperium-steel-dark">Comma separated</p>
          </div>

          {/* Options */}
          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-gold" />
              OPTIONS
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 border-2 border-imperium-steel-dark bg-imperium-black focus:ring-imperium-crimson checked:bg-imperium-crimson checked:border-imperium-crimson"
              />
              <span className="font-terminal text-sm text-imperium-bone">Featured archive</span>
            </label>
          </div>

          {/* Preview Link */}
          {formData.slug && (
            <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
              <a
                href={`/blog/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-terminal text-sm text-imperium-bone hover:text-imperium-gold transition-colors"
              >
                <Eye className="h-4 w-4" />
                PREVIEW
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t-2 border-imperium-steel-dark pt-6">
        <motion.button
          onMouseEnter={playHover}
          onClick={() => setView('posts')}
          className="border-2 border-imperium-steel-dark px-6 py-3 font-display text-sm uppercase tracking-wider text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone transition-all"
        >
          ABORT
        </motion.button>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 font-terminal text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              SAVED
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 font-terminal text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              ERROR
            </span>
          )}
          <div className="flex gap-3">
            <motion.button
              type="button"
              onMouseEnter={playHover}
              onClick={() => handleSubmit(false)}
              disabled={isPending || !formData.title || !formData.content}
              className="border-2 border-imperium-steel-dark px-6 py-3 font-display text-sm uppercase tracking-wider text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'SAVING...' : 'SAVE DRAFT'}
            </motion.button>
            <motion.button
              type="button"
              onMouseEnter={playHover}
              onClick={() => handleSubmit(true)}
              disabled={isPending || !formData.title || !formData.content}
              className="border-2 border-imperium-crimson bg-imperium-crimson/20 px-6 py-3 font-display text-sm uppercase tracking-wider text-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-bone transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isPending ? 'PUBLISHING...' : postId ? 'UPDATE' : 'PUBLISH'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
