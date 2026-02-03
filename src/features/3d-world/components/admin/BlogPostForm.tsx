'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, FileText, Upload, X as XIcon, Eye, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getPostBySlug } from '@/actions/blog';
import { getAllCategories } from '@/actions/blog';
import { useCreatePost, useUpdatePost } from '@/features/blog/queries';
import { useInWorldAdminStore } from '@/features/admin/store';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';
import { useForm } from '@tanstack/react-form';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('./markdown-editor').then(mod => ({ default: mod.MarkdownEditor })),
  { ssr: false }
);

export function BlogPostForm({ postId }: { postId?: string }) {
  const { setView } = useInWorldAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playHover, playClick } = useUISound();

  const form = useForm({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      categoryId: '',
      coverImage: '',
      tags: '',
      featured: false,
    },
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
          form.setFieldValue('title', post.title);
          form.setFieldValue('slug', post.slug);
          form.setFieldValue('excerpt', post.excerpt || '');
          form.setFieldValue('content', post.content || '');
          form.setFieldValue('categoryId', catId);
          form.setFieldValue('coverImage', post.coverImage || '');
          form.setFieldValue('tags', post.tags?.join(', ') || '');
          form.setFieldValue('featured', post.featured);
        }
      } catch {
        // Error silently ignored
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
      const img = document.createElement('img');
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

        form.setFieldValue('coverImage', compressedDataUrl);
        setUploadProgress(100);
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 500);
      };

      img.onerror = () => {
        setIsUploading(false);
        setUploadProgress(0);
      };

      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    setSaveStatus('idle');
    const values = form.state.values;
    const data = {
      title: values.title,
      slug: values.slug || generateSlug(values.title),
      excerpt: values.excerpt || undefined,
      content: values.content,
      categoryId: values.categoryId || undefined,
      coverImage: values.coverImage || undefined,
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured: values.featured,
      published: publish,
    };

    try {
      if (postId) {
        await updateMutation.mutateAsync({ slug: values.slug, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setSaveStatus('success');
      setView('posts');
    } catch {
      setSaveStatus('error');
    }
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
      {form.state.values.coverImage && (
        <div className="relative aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black">
          <Image src={form.state.values.coverImage} alt="Cover preview" width={800} height={450} className="w-full h-full object-cover" unoptimized />
          <motion.button
            type="button"
            onMouseEnter={playHover}
            onClick={() => form.setFieldValue('coverImage', '')}
            className="absolute top-3 right-3 border-2 border-imperium-crimson bg-imperium-crimson/10 p-2 text-imperium-crimson hover:bg-imperium-crimson hover:text-imperium-bone transition-all"
          >
            <XIcon className="h-4 w-4" />
          </motion.button>
        </div>
      )}

      {/* Title and Slug */}
      <div className="space-y-2">
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => value.length > 0 ? undefined : "Title is required",
            onChangeAsync: async ({ value }) => {
              if (value.length > 200) return "Title too long";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <input
                type="text"
                name={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  if (!postId) {
                    form.setFieldValue('slug', generateSlug(e.target.value));
                  }
                }}
                required
                placeholder="ENTER ARCHIVE TITLE..."
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-display text-xl uppercase tracking-wider text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-crimson transition-colors"
              />
              {field.state.meta.errors && (
                <p className="font-terminal text-xs text-imperium-crimson mt-1">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>
        <p className="font-terminal text-xs text-imperium-steel-dark pl-1">
          /{form.state.values.slug || 'SLUG-AUTO-GENERATED'}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Main content */}
        <div className="col-span-2 space-y-4">
          {/* Excerpt */}
          <form.Field
            name="excerpt"
            validators={{
              onChangeAsync: async ({ value }) => {
                if (value.length > 500) return "Excerpt too long";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                  {'>'} EXCERPT
                </label>
                <textarea
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                  placeholder="Brief summary for archive display..."
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-crimson resize-none"
                />
                {field.state.meta.errors && (
                  <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Content */}
          <form.Field
            name="content"
            validators={{
              onChange: ({ value }) => value.length > 0 ? undefined : "Content is required",
            }}
          >
            {(field) => (
              <div>
                <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                  {'>'} CONTENT *
                </label>
                <MarkdownEditor
                  content={field.state.value}
                  onChange={(content) => field.handleChange(content)}
                  placeholder="# Archive Title

Write your content here in **markdown**..."
                  editable
                />
                {field.state.meta.errors && (
                  <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Category */}
          <form.Field name="categoryId">
            {(field) => (
              <div>
                <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                  {'>'} CATEGORY
                </label>
                <select
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
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
            )}
          </form.Field>
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
            <form.Field name="coverImage">
              {(field) => (
                <input
                  type="url"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://..."
                  className="mt-3 w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-xs text-imperium-bone focus:outline-none focus:border-imperium-crimson"
                />
              )}
            </form.Field>
          </div>

          {/* Tags */}
          <form.Field
            name="tags"
            validators={{
              onChangeAsync: async ({ value }) => {
                if (value.length > 200) return "Tags too long";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
                <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
                  <span className="w-1 h-4 bg-imperium-crimson" />
                  TAGS
                </h3>
                <input
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="react, nextjs, typescript"
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-crimson"
                />
                <p className="mt-1 font-terminal text-xs text-imperium-steel-dark">Comma separated</p>
                {field.state.meta.errors && (
                  <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Options */}
          <form.Field name="featured">
            {(field) => (
              <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
                <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
                  <span className="w-1 h-4 bg-imperium-gold" />
                  OPTIONS
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    id="featured"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-imperium-steel-dark bg-imperium-black focus:ring-imperium-crimson checked:bg-imperium-crimson checked:border-imperium-crimson"
                  />
                  <span className="font-terminal text-sm text-imperium-bone">Featured archive</span>
                </label>
              </div>
            )}
          </form.Field>

          {/* Preview Link */}
          {form.state.values.slug && (
            <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
              <a
                href={`/blog/${form.state.values.slug}`}
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
              disabled={isPending || !form.state.values.title || !form.state.values.content}
              className="border-2 border-imperium-steel-dark px-6 py-3 font-display text-sm uppercase tracking-wider text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'SAVING...' : 'SAVE DRAFT'}
            </motion.button>
            <motion.button
              type="button"
              onMouseEnter={playHover}
              onClick={() => handleSubmit(true)}
              disabled={isPending || !form.state.values.title || !form.state.values.content}
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
