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
import { useProjectCategories } from './queries/use-project-categories';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('./markdown-editor').then(mod => ({ default: mod.MarkdownEditor })),
  { ssr: false }
);

type FormData = {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  thumbnail: string;
  featured: boolean;
  sortOrder: number;
  year: number;
  categoryId: string;
};

export function ProjectForm({ projectId }: { projectId?: string }) {
  const { setView } = useInWorldAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playHover, playClick } = useUISound();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    techStack: [],
    githubUrl: '',
    liveUrl: '',
    thumbnail: '',
    featured: false,
    sortOrder: 0,
    year: new Date().getFullYear(),
    categoryId: '',
  });

  const { categories, isLoading: categoriesLoading } = useProjectCategories();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoading = categoriesLoading || (projectId && !formData.title);

  // Load project data when editing
  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      try {
        const project = await getProjectById(projectId);
        if (project) {
          setFormData({
            title: project.title,
            slug: project.slug,
            description: project.description,
            longDescription: project.longDescription || '',
            techStack: project.techStack || [],
            githubUrl: project.githubUrl || '',
            liveUrl: project.liveUrl || '',
            thumbnail: project.thumbnail || '',
            featured: project.featured,
            sortOrder: project.sortOrder,
            year: project.year,
            categoryId: project.categoryId || '',
          });
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    }
    loadProject();
  }, [projectId]);

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].id,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length, categories[0]?.id]);

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
      slug: projectId ? prev.slug : generateSlug(newTitle),
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

        setFormData((prev) => ({ ...prev, thumbnail: compressedDataUrl }));
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

  const handleSubmit = async () => {
    if (!formData.categoryId && categories.length > 0) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    setSaveStatus('idle');
    const data: CreateProjectInput = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      description: formData.description,
      longDescription: formData.longDescription || undefined,
      techStack: formData.techStack,
      githubUrl: formData.githubUrl || undefined,
      liveUrl: formData.liveUrl || undefined,
      thumbnail: formData.thumbnail || undefined,
      featured: formData.featured,
      sortOrder: formData.sortOrder,
      year: formData.year,
      categoryId: formData.categoryId,
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
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
      {formData.thumbnail && (
        <div className="relative aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black">
          <Image src={formData.thumbnail} alt="Thumbnail preview" width={800} height={450} className="w-full h-full object-cover" unoptimized />
          <motion.button
            type="button"
            onMouseEnter={playHover}
            onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
            className="absolute top-3 right-3 border-2 border-imperium-gold bg-imperium-gold/10 p-2 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
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
          placeholder="ENTER BLUEPRINT DESIGNATION..."
          className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-display text-xl uppercase tracking-wider text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold transition-colors"
        />
        <p className="font-terminal text-xs text-imperium-steel-dark pl-1">
          /{formData.slug || 'SLUG-AUTO-GENERATED'}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Main content */}
        <div className="col-span-2 space-y-4">
          {/* Category and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} CATEGORY
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
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
              {categories.length === 0 && (
                <p className="mt-1 font-terminal text-xs text-imperium-crimson">No categories available. Create one first.</p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} YEAR
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} BRIEF DESCRIPTION *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              required
              placeholder="Brief project description..."
              className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold resize-none"
            />
          </div>

          {/* Long Description */}
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} FULL SPECIFICATIONS
            </label>
            <MarkdownEditor
              content={formData.longDescription}
              onChange={(content) => setFormData(prev => ({ ...prev, longDescription: content }))}
              placeholder="# Project Blueprint

Describe the **context**, **challenges**, and **solutions**..."
              editable
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} TECH STACK
            </label>
            <TagInput
              value={formData.techStack}
              onChange={(tags) => setFormData((prev) => ({ ...prev, techStack: tags }))}
              placeholder="React, TypeScript, Tailwind..."
              className="w-full"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} SOURCE CODE
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} DEPLOYED UNIT
              </label>
              <input
                type="url"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
              />
            </div>
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
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-3 w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-xs text-imperium-bone focus:outline-none focus:border-imperium-gold"
            />
          </div>

          {/* Display Options */}
          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-crimson" />
              DISPLAY OPTIONS
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 border-2 border-imperium-steel-dark bg-imperium-black checked:bg-imperium-gold checked:border-imperium-gold focus:ring-imperium-gold"
                />
                <span className="font-terminal text-sm text-imperium-bone">Featured blueprint</span>
              </label>

              <div>
                <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">DISPLAY PRIORITY</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-crimson"
                />
                <p className="mt-1 font-terminal text-xs text-imperium-steel-dark">Lower = shown first</p>
              </div>
            </div>
          </div>

          {/* Preview Link */}
          {formData.slug && (
            <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
              <a
                href={`/portfolio#${formData.slug}`}
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
            disabled={isPending || !formData.title || !formData.description || !formData.categoryId}
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
