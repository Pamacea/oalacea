'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X as XIcon, Eye, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { createProject, updateProject, getProjectCategories } from '@/actions/projects';
import { GlitchText } from '@/components/ui/imperium';
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('@/features/3d-world/components/admin/markdown-editor').then(mod => ({ default: mod.MarkdownEditor })),
  { ssr: false, loading: () => <div className="w-full h-64 border-2 border-imperium-steel-dark bg-imperium-black animate-pulse" /> }
);

type FormData = {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  year: string;
  categoryId: string;
  techStack: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  world: 'DEV' | 'ART' | '';
  worldX: string;
  worldZ: string;
};

interface ProjectFormProps {
  projectId?: string;
}

export function ProjectForm({ projectId }: ProjectFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
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
    world: '',
    worldX: '',
    worldZ: '',
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
          setFormData({
            title: project.title,
            slug: project.slug,
            description: project.description || '',
            longDescription: project.longDescription || '',
            thumbnail: project.thumbnail || '',
            year: project.year?.toString() || new Date().getFullYear().toString(),
            categoryId: catId,
            techStack: project.techStack?.join(', ') || '',
            githubUrl: project.githubUrl || '',
            liveUrl: project.liveUrl || '',
            featured: project.featured,
            world: project.worldPosition?.world || '',
            worldX: project.worldPosition?.x?.toString() || '',
            worldZ: project.worldPosition?.z?.toString() || '',
          });
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [projectId]);

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

        setFormData((prev) => ({ ...prev, thumbnail: compressedDataUrl }));
        setUploadProgress(100);
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 500);
      };

      img.onerror = () => {
        setIsUploading(false);
        setUploadProgress(0);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    setSaveStatus('idle');
    setIsSaving(true);

    try {
      const data = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        longDescription: formData.longDescription || undefined,
        thumbnail: formData.thumbnail || undefined,
        year: parseInt(formData.year) || new Date().getFullYear(),
        categoryId: formData.categoryId,
        techStack: formData.techStack.split(',').map((t) => t.trim()).filter(Boolean),
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        featured: formData.featured,
        worldPosition: formData.world ? {
          world: formData.world as 'DEV' | 'ART',
          x: parseFloat(formData.worldX) || 0,
          z: parseFloat(formData.worldZ) || 0,
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

      {formData.thumbnail && (
        <div className="relative aspect-video border-2 border-imperium-steel-dark overflow-hidden bg-imperium-black">
          <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
            className="absolute top-3 right-3 border-2 border-imperium-gold bg-imperium-gold/10 p-2 text-imperium-gold hover:bg-imperium-gold hover:text-imperium-black transition-all"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleTitleChange}
          required
          placeholder="ENTER BLUEPRINT TITLE..."
          className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-display text-xl uppercase tracking-wider text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold transition-colors"
        />
        <p className="font-terminal text-xs text-imperium-steel-dark pl-1">
          /{formData.slug || 'SLUG-AUTO-GENERATED'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} DESCRIPTION *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Short description for project cards..."
              className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} LONG DESCRIPTION
            </label>
            <Suspense fallback={<div className="w-full h-64 border-2 border-imperium-steel-dark bg-imperium-black animate-pulse" />}>
              <MarkdownEditor
                content={formData.longDescription}
                onChange={(content) => setFormData(prev => ({ ...prev, longDescription: content }))}
                placeholder="Detailed project description..."
                editable
              />
            </Suspense>
          </div>

          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
              {'>'} CATEGORY
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
            >
              <option value="">-- SELECT CATEGORY --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} YEAR
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2024"
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} TECH STACK
              </label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                placeholder="React, TypeScript, Three.js"
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} GITHUB URL
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-sm uppercase tracking-wider text-imperium-steel">
                {'>'} LIVE URL
              </label>
              <input
                type="url"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
              />
            </div>
          </div>

          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <Globe className="h-4 w-4" />
              WORLD POSITION
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">WORLD</label>
                <select
                  name="world"
                  value={formData.world}
                  onChange={handleChange}
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone focus:outline-none focus:border-imperium-gold"
                >
                  <option value="">-- NONE --</option>
                  <option value="DEV">DEV</option>
                  <option value="ART">ART</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">X</label>
                <input
                  type="number"
                  name="worldX"
                  value={formData.worldX}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.1"
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                />
              </div>
              <div>
                <label className="mb-1 block font-terminal text-xs text-imperium-steel-dark">Z</label>
                <input
                  type="number"
                  name="worldZ"
                  value={formData.worldZ}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.1"
                  className="w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-sm text-imperium-bone placeholder:text-imperium-steel-dark focus:outline-none focus:border-imperium-gold"
                />
              </div>
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
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-3 w-full border-2 border-imperium-steel-dark bg-imperium-black px-3 py-2 font-terminal text-xs text-imperium-bone focus:outline-none focus:border-imperium-gold"
            />
          </div>

          <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
            <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-imperium-steel flex items-center gap-2">
              <span className="w-1 h-4 bg-imperium-gold" />
              OPTIONS
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                id="featured-project"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 border-2 border-imperium-steel-dark bg-imperium-black checked:bg-imperium-gold checked:border-imperium-gold"
              />
              <span className="font-terminal text-sm text-imperium-bone">Featured blueprint</span>
            </label>
          </div>

          {formData.slug && (
            <div className="border-2 border-imperium-steel-dark bg-imperium-black p-4">
              <a
                href={`/portfolio/${formData.slug}`}
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
            disabled={isSaving || !formData.title || !formData.description}
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
