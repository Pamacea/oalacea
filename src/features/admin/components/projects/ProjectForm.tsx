'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Upload, X as XIcon, Eye, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { createProject, updateProject, getProjectCategories } from '@/actions/projects';
import { GlitchText } from '@/components/ui/imperium';
import { useForm } from '@tanstack/react-form';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('@/shared/components/editor').then(mod => ({ default: mod.MarkdownEditor })),
  { ssr: false, loading: () => <div className="w-full h-64 border-2 border-imperium-steel-dark bg-imperium-black animate-pulse" /> }
);

interface ProjectFormProps {
  projectId?: string;
}

export function ProjectForm({ projectId }: ProjectFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      longDescription: '',
      thumbnail: '',
      year: new Date().getFullYear().toString(),
      categoryId: '',
      techStack: '',
      githubUrl: '',
      liveUrl: '',
      featured: false,
      world: '' as 'DEV' | 'ART' | '',
      worldX: '',
      worldZ: '',
    },
  });

  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [isLoading, setIsLoading] = useState(!!projectId);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function loadData() {
      const cats = await getProjectCategories().catch(() => []);
      setCategories(cats);

      if (projectId) {
        const project = await fetch(`/api/projects/${projectId}`).then(r => r.json()).catch(() => null);
        if (project) {
          const catId = cats?.find((c) => c.id === project.categoryId)?.id || '';
          form.setFieldValue('title', project.title);
          form.setFieldValue('slug', project.slug);
          form.setFieldValue('description', project.description || '');
          form.setFieldValue('longDescription', project.longDescription || '');
          form.setFieldValue('thumbnail', project.thumbnail || '');
          form.setFieldValue('year', project.year?.toString() || new Date().getFullYear());
          form.setFieldValue('categoryId', catId);
          form.setFieldValue('techStack', project.techStack?.join(', ') || '');
          form.setFieldValue('githubUrl', project.githubUrl || '');
          form.setFieldValue('liveUrl', project.liveUrl || '');
          form.setFieldValue('featured', project.featured);
          form.setFieldValue('world', project.worldPosition?.world || '');
          form.setFieldValue('worldX', project.worldPosition?.x?.toString() || '');
          form.setFieldValue('worldZ', project.worldPosition?.z?.toString() || '');
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

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

        form.setFieldValue('thumbnail', compressedDataUrl);
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

  const handleSubmit = async () => {
    setSaveStatus('idle');
    setIsSaving(true);

    try {
      const values = form.state.values;
      const data = {
        title: values.title,
        slug: values.slug || generateSlug(values.title),
        description: values.description,
        longDescription: values.longDescription || undefined,
        thumbnail: values.thumbnail || undefined,
        year: parseInt(values.year) || new Date().getFullYear(),
        categoryId: values.categoryId,
        techStack: values.techStack.split(',').map((t) => t.trim()).filter(Boolean),
        githubUrl: values.githubUrl || undefined,
        liveUrl: values.liveUrl || undefined,
        featured: values.featured,
        worldPosition: values.world ? {
          world: values.world as 'DEV' | 'ART',
          x: parseFloat(values.worldX) || 0,
          z: parseFloat(values.worldZ) || 0,
        } : undefined,
      };

      if (projectId) {
        await updateProject(projectId, data);
      } else {
        await createProject(data);
      }

      setSaveStatus('success');
      setTimeout(() => router.push('/admin/projects'), 1000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-4 text-imperium-gold"
        >
          ⚙
        </motion.div>
        <p className="font-terminal text-imperium-steel">LOADING DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark pb-4">
        <Link
          href="/admin/projects"
          className="flex items-center gap-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone px-4 py-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          RETURN
        </Link>
        <h2 className="font-display text-xl uppercase tracking-wider text-imperium-gold flex items-center gap-3">
          <GlitchText intensity="low">
            {projectId ? '[ MODIFY BLUEPRINT ]' : '[ NEW BLUEPRINT ]'}
          </GlitchText>
        </h2>
        <div className="w-6" />
      </div>

      {form.state.values.thumbnail && (
        <div className="relative aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black">
          <Image src={form.state.values.thumbnail} alt="Thumbnail preview" width={800} height={450} className="w-full h-full object-cover" unoptimized />
          <button
            type="button"
            onClick={() => form.setFieldValue('thumbnail', '')}
            className="absolute top-3 right-3 border-2 border-imperium-gold bg-imperium-gold/10 p-2 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

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
                  if (!projectId) {
                    form.setFieldValue('slug', generateSlug(e.target.value));
                  }
                }}
                required
                placeholder="ENTER BLUEPRINT TITLE..."
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-display text-xl uppercase tracking-wider text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold transition-colors"
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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} DESCRIPTION *
            </label>
            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) => value.length > 0 ? undefined : "Description is required",
                onChangeAsync: async ({ value }) => {
                  if (value.length > 1000) return "Description too long";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <textarea
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={2}
                    placeholder="Short description for project cards..."
                    className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold resize-none"
                  />
                  {field.state.meta.errors && (
                    <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} LONG DESCRIPTION
            </label>
            <form.Field name="longDescription">
              {(field) => (
                <Suspense fallback={<div className="w-full h-64 border-2 border-imperium-steel-dark bg-imperium-black animate-pulse" />}>
                  <MarkdownEditor
                    content={field.state.value}
                    onChange={(content) => field.handleChange(content)}
                    placeholder="Detailed project description..."
                    editable
                  />
                </Suspense>
              )}
            </form.Field>
          </div>

          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} CATEGORY
            </label>
            <form.Field name="categoryId">
              {(field) => (
                <select
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
                >
                  <option value="">-- SELECT CATEGORY --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} YEAR
              </label>
              <form.Field
                name="year"
                validators={{
                  onChange: ({ value }) => {
                    const year = parseInt(value);
                    return year > 1900 && year <= 2100 ? undefined : "Invalid year";
                  },
                }}
              >
                {(field) => (
                  <div>
                    <input
                      type="number"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="2024"
                      className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                    />
                    {field.state.meta.errors && (
                      <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} TECH STACK
              </label>
              <form.Field
                name="techStack"
                validators={{
                  onChangeAsync: async ({ value }) => {
                    if (value.length > 200) return "Tech stack too long";
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
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="React, TypeScript, Three.js"
                      className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                    />
                    {field.state.meta.errors && (
                      <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="githubUrl"
              validators={{
                onChangeAsync: async ({ value }) => {
                  if (value && !/^https?:\/\/.+/.test(value)) {
                    return "Invalid URL";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                    {'>'} GITHUB URL
                  </label>
                  <input
                    type="url"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                  />
                  {field.state.meta.errors && (
                    <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="liveUrl"
              validators={{
                onChangeAsync: async ({ value }) => {
                  if (value && !/^https?:\/\/.+/.test(value)) {
                    return "Invalid URL";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                    {'>'} LIVE URL
                  </label>
                  <input
                    type="url"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                  />
                  {field.state.meta.errors && (
                    <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <Globe className="h-4 w-4" />
              WORLD POSITION
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <form.Field name="world">
                {(field) => (
                  <div>
                    <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">WORLD</label>
                    <select
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as 'DEV' | 'ART' | '')}
                      className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
                    >
                      <option value="">-- NONE --</option>
                      <option value="DEV">DEV</option>
                      <option value="ART">ART</option>
                    </select>
                  </div>
                )}
              </form.Field>
              <form.Field name="worldX">
                {(field) => (
                  <div>
                    <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">X</label>
                    <input
                      type="number"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0"
                      step="0.1"
                      className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="worldZ">
                {(field) => (
                  <div>
                    <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">Z</label>
                    <input
                      type="number"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0"
                      step="0.1"
                      className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-gold" />
              THUMBNAIL
            </h3>
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
              className="w-full border-2 border-dashed border-imperium-steel-dark py-6 text-center transition-all hover:border-imperium-steel hover:bg-imperium-steel/10 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="space-y-2">
                  <div className="h-1 w-full bg-imperium-steel overflow-hidden">
                    <div
                      className="h-full bg-imperium-gold transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="font-terminal text-xs text-imperium-steel">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-imperium-steel" />
                  <p className="font-terminal text-sm text-imperium-steel">CLICK TO UPLOAD</p>
                </div>
              )}
            </button>
            <form.Field name="thumbnail">
              {(field) => (
                <input
                  type="url"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://..."
                  className="mt-3 w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-xs text-imperium-bone focus:outline-none focus:border-imperium-gold"
                />
              )}
            </form.Field>
          </div>

          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-gold" />
              OPTIONS
            </h3>
            <form.Field name="featured">
              {(field) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    id="featured"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 border-2 border-imperium-steel-dark bg-imperium-black checked:bg-imperium-gold checked:border-imperium-gold"
                  />
                  <span className="font-terminal text-sm text-imperium-bone">Featured blueprint</span>
                </label>
              )}
            </form.Field>
          </div>

          {form.state.values.slug && (
            <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
              <a
                href={`/portfolio/${form.state.values.slug}`}
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

      <div className="flex items-center justify-between border-t-2 border-imperium-steel-dark pt-6">
        <Link
          href="/admin/projects"
          className="border-2 border-imperium-steel-dark px-6 py-3 font-display text-sm uppercase tracking-wider text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone transition-all"
        >
          ABORT
        </Link>
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
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || !form.state.values.title || !form.state.values.description}
            className="border-2 border-imperium-gold bg-imperium-gold/20 px-6 py-3 font-display text-sm uppercase tracking-wider text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'SAVING...' : projectId ? 'UPDATE BLUEPRINT' : 'FORGE BLUEPRINT'}
          </button>
        </div>
      </div>
    </div>
  );
}
