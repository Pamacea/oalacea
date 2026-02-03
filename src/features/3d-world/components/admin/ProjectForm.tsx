'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, X as XIcon, Eye, CheckCircle, AlertCircle, Hammer } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getProjectById } from '@/actions/projects';
import { useCreateProject, useUpdateProject, type CreateProjectInput } from './queries/use-project-mutations';
import { useInWorldAdminStore } from '@/features/admin/store';
import { TagInput } from '@/components/ui/tag-input';
import { GlitchText } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';
import { useForm } from '@tanstack/react-form';
import { useProjectCategories } from './queries/use-project-categories';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('@/shared/components/editor').then(mod => ({ default: mod.MarkdownEditor })),
  { ssr: false }
);

export function ProjectForm({ projectId }: { projectId?: string }) {
  const { setView } = useInWorldAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playHover, playClick } = useUISound();

  const form = useForm({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      longDescription: '',
      techStack: [] as string[],
      githubUrl: '',
      liveUrl: '',
      thumbnail: '',
      featured: false,
      sortOrder: 0,
      year: new Date().getFullYear(),
      categoryId: '',
    },
  });

  const { categories, isLoading: categoriesLoading } = useProjectCategories();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoading = categoriesLoading || (projectId && !form.state.values.title);

  // Load project data when editing
  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      try {
        const project = await getProjectById(projectId);
        if (project) {
          form.setFieldValue('title', project.title);
          form.setFieldValue('slug', project.slug);
          form.setFieldValue('description', project.description);
          form.setFieldValue('longDescription', project.longDescription || '');
          form.setFieldValue('techStack', project.techStack || []);
          form.setFieldValue('githubUrl', project.githubUrl || '');
          form.setFieldValue('liveUrl', project.liveUrl || '');
          form.setFieldValue('thumbnail', project.thumbnail || '');
          form.setFieldValue('featured', project.featured);
          form.setFieldValue('sortOrder', project.sortOrder);
          form.setFieldValue('year', project.year);
          form.setFieldValue('categoryId', project.categoryId || '');
        }
      } catch {
        // Error silently ignored
      }
    }
    loadProject();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default category when categories are loaded (only for new projects)
  useEffect(() => {
    if (!projectId && categories.length > 0 && !form.state.values.categoryId) {
      form.setFieldValue('categoryId', categories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length, projectId]);

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
    if (!form.state.values.categoryId && categories.length > 0) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    setSaveStatus('idle');
    const values = form.state.values;
    const data: CreateProjectInput = {
      title: values.title,
      slug: values.slug || generateSlug(values.title),
      description: values.description,
      longDescription: values.longDescription || undefined,
      techStack: values.techStack,
      githubUrl: values.githubUrl || undefined,
      liveUrl: values.liveUrl || undefined,
      thumbnail: values.thumbnail || undefined,
      featured: values.featured,
      sortOrder: values.sortOrder,
      year: values.year,
      categoryId: values.categoryId,
    };

    try {
      if (projectId) {
        await updateMutation.mutateAsync({ id: projectId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setSaveStatus('success');
      setView('projects');
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
        <p className="font-terminal text-imperium-steel">Loading blueprint data...</p>
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
            setView('projects');
            playClick();
          }}
          className="flex items-center gap-2 font-terminal text-sm border-2 border-imperium-steel-dark text-imperium-steel hover:border-imperium-steel hover:text-imperium-bone px-4 py-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          RETURN
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="border-2 border-imperium-gold bg-imperium-gold/10 p-2">
            <Hammer className="h-5 w-5 text-imperium-gold" />
          </div>
          <h2 className="font-display text-lg uppercase tracking-wider text-imperium-bone">
            <GlitchText intensity="low">
              {projectId ? 'MODIFY BLUEPRINT' : 'NEW BLUEPRINT ENTRY'}
            </GlitchText>
          </h2>
        </div>
        <div className="w-6" />
      </div>

      {/* Thumbnail Preview */}
      {form.state.values.thumbnail && (
        <div className="relative aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black">
          <Image src={form.state.values.thumbnail} alt="Thumbnail preview" width={800} height={450} className="w-full h-full object-cover" unoptimized />
          <motion.button
            type="button"
            onMouseEnter={playHover}
            onClick={() => form.setFieldValue('thumbnail', '')}
            className="absolute top-3 right-3 border-2 border-imperium-gold bg-imperium-gold/10 p-2 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
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
                  if (!projectId) {
                    form.setFieldValue('slug', generateSlug(e.target.value));
                  }
                }}
                required
                placeholder="ENTER BLUEPRINT DESIGNATION..."
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Main content */}
        <div className="col-span-2 space-y-4">
          {/* Category and Year */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="categoryId"
              validators={{
                onChange: (value) => value ? undefined : "Category is required",
              }}
            >
              {(field) => (
                <div>
                  <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                    {'>'} CATEGORY
                  </label>
                  <select
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
                    required
                  >
                    <option value="">-- SELECT CATEGORY --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors && (
                    <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                  {categories.length === 0 && (
                    <p className="mt-1 font-terminal text-xs text-imperium-crimson">No categories available. Create one first.</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="year"
              validators={{
                onChange: ({ value }) => value > 1900 && value <= 2100 ? undefined : "Invalid year",
              }}
            >
              {(field) => (
                <div>
                  <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                    {'>'} YEAR
                  </label>
                  <input
                    type="number"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    required
                    className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
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

          {/* Description */}
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
                <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                  {'>'} BRIEF DESCRIPTION *
                </label>
                <textarea
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                  required
                  placeholder="Brief project description..."
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

          {/* Long Description */}
          <form.Field name="longDescription">
            {(field) => (
              <div>
                <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                  {'>'} FULL SPECIFICATIONS
                </label>
                <MarkdownEditor
                  content={field.state.value}
                  onChange={(content) => field.handleChange(content)}
                  placeholder="# Project Blueprint

Describe the **context**, **challenges**, and **solutions**..."
                  editable
                />
              </div>
            )}
          </form.Field>

          {/* Tech Stack */}
          <form.Field name="techStack">
            {(field) => (
              <div>
                <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                  {'>'} TECH STACK
                </label>
                <TagInput
                  value={field.state.value}
                  onChange={(tags) => field.handleChange(tags)}
                  placeholder="React, TypeScript, Tailwind..."
                  className="w-full"
                />
              </div>
            )}
          </form.Field>

          {/* Links */}
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
                    {'>'} SOURCE CODE
                  </label>
                  <input
                    type="url"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
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
                    {'>'} DEPLOYED UNIT
                  </label>
                  <input
                    type="url"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
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

        {/* Right - Sidebar */}
        <div className="space-y-4">
          {/* Thumbnail Upload */}
          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-gold" />
              BLUEPRINT IMAGE
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
                  <p className="font-terminal text-xs text-imperium-steel-dark">or paste URL</p>
                </div>
              )}
            </motion.button>
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

          {/* Display Options */}
          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-crimson" />
              DISPLAY OPTIONS
            </h3>

            <div className="space-y-3">
              <form.Field name="featured">
                {(field) => (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="h-4 w-4 border-2 border-imperium-steel-dark bg-imperium-black checked:bg-imperium-gold checked:border-imperium-gold focus:ring-imperium-gold"
                    />
                    <span className="font-terminal text-sm text-imperium-bone">Featured blueprint</span>
                  </label>
                )}
              </form.Field>

              <form.Field name="sortOrder">
                {(field) => (
                  <div>
                    <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">DISPLAY PRIORITY</label>
                    <input
                      type="number"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-crimson"
                    />
                    <p className="mt-1 font-terminal text-xs text-imperium-steel-dark">Lower = shown first</p>
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* Preview Link */}
          {form.state.values.slug && (
            <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
              <a
                href={`/portfolio#${form.state.values.slug}`}
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
          onClick={() => setView('projects')}
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
          <motion.button
            type="button"
            onMouseEnter={playHover}
            onClick={handleSubmit}
            disabled={isPending || !form.state.values.title || !form.state.values.description || !form.state.values.categoryId}
            className="border-2 border-imperium-gold bg-imperium-gold/20 px-6 py-3 font-display text-sm uppercase tracking-wider text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Hammer className="h-4 w-4" />
            {isPending ? 'FORGING...' : projectId ? 'UPDATE' : 'FORGE'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
