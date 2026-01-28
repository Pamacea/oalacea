'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { createProject, updateProject, getProjects } from '@/actions/projects';
import { ProjectCategory } from '@/generated/prisma/enums';
import { ArrowLeft, Save, FolderKanban, Upload, X as XIcon, Eye } from 'lucide-react';
import { useInWorldAdminStore } from '@/store/in-world-admin-store';
import type { Project } from '@/generated/prisma/client';

const categoryLabels: Record<ProjectCategory, string> = {
  WEB: 'Web',
  MOBILE: 'Mobile',
  THREE_D: '3D',
  AI: 'IA',
  OTHER: 'Autre',
};

const categories = Object.values(ProjectCategory);

type FormData = {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  techStack: string;
  githubUrl: string;
  liveUrl: string;
  thumbnail: string;
  featured: boolean;
  sortOrder: number;
  year: number;
  category: ProjectCategory;
};

// Zinc color scheme - minimal and consistent
const inputBorder = 'border-zinc-700 focus:border-zinc-600';
const buttonPrimary = 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100';
const buttonSecondary = 'border-zinc-700 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400';

export function ProjectForm({ projectId, world }: { projectId?: string; world: 'dev' | 'art' }) {
  const { setView } = useInWorldAdminStore();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = inputBorder;

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    thumbnail: '',
    featured: false,
    sortOrder: 0,
    year: new Date().getFullYear(),
    category: ProjectCategory.WEB,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load project data if editing
  useEffect(() => {
    async function loadProject() {
      try {
        if (projectId) {
          const projects = await getProjects();
          const project = projects.find((p: Project) => p.id === projectId);
          if (project) {
            setFormData({
              title: project.title,
              slug: project.slug,
              description: project.description,
              longDescription: project.longDescription || '',
              techStack: project.techStack?.join(', ') || '',
              githubUrl: project.githubUrl || '',
              liveUrl: project.liveUrl || '',
              thumbnail: project.thumbnail || '',
              featured: project.featured,
              sortOrder: project.sortOrder,
              year: project.year,
              category: project.category,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
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

  const handleSubmit = () => {
    startTransition(async () => {
      const data: any = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        longDescription: formData.longDescription || undefined,
        techStack: formData.techStack.split(',').map((t) => t.trim()).filter(Boolean),
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        thumbnail: formData.thumbnail || undefined,
        featured: formData.featured,
        sortOrder: formData.sortOrder,
        year: formData.year,
        category: formData.category,
      };

      if (projectId) {
        await updateProject(projectId, data);
      } else {
        await createProject(data);
      }
      setView('projects');
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
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  if (isLoading && projectId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-zinc-300`}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('projects')}
          className={`flex items-center gap-2 text-sm ${buttonSecondary} px-3 py-2 rounded-lg transition-colors`}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <h2 className={`text-lg font-bold text-zinc-300`}>
          {projectId ? 'Modifier le projet' : 'Nouveau projet'}
        </h2>
        <div className="w-6" />
      </div>

      {/* Thumbnail Preview */}
      {formData.thumbnail && (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/10">
          <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
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
          placeholder="Nom du projet..."
          className={`w-full rounded-xl border ${inputBorder} bg-zinc-900 px-4 py-3 text-xl font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors`}
        />
        <p className={`text-xs text-zinc-300font-mono text-zinc-600 pl-1`}>
          /{formData.slug || 'slug-auto-genere'}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left - Main content */}
        <div className="col-span-2 space-y-4">
          {/* Category and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`mb-2 block text-sm font-medium text-zinc-300`}>Catégorie</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none`}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium text-zinc-300`}>Année</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`mb-2 block text-sm font-medium text-zinc-300`}>Description courte *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              required
              placeholder="Une brève description du projet..."
              className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none resize-none`}
            />
          </div>

          {/* Long Description */}
          <div>
            <label className={`mb-2 block text-sm font-medium text-zinc-300`}>Description longue</label>
            <textarea
              name="longDescription"
              value={formData.longDescription}
              onChange={handleChange}
              rows={5}
              placeholder="Description détaillée du projet, challenges, solutions..."
              className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none resize-y`}
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className={`mb-2 block text-sm font-medium text-zinc-300`}>Stack technique</label>
            <input
              type="text"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="React, TypeScript, Tailwind..."
              className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none`}
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`mb-2 block text-sm font-medium text-zinc-300`}>GitHub</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none`}
              />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium text-zinc-300`}>Site en ligne</label>
              <input
                type="url"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleChange}
                placeholder="https://..."
                className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-zinc-100 text-sm focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-4">
          {/* Thumbnail Upload */}
          <div className={`rounded-xl border ${inputBorder} bg-slate-900/30 p-4`}>
            <h3 className={`mb-3 text-sm font-semibold text-zinc-300}`}>Miniature</h3>
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
                  <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-zinc-700 transition-all`} style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-zinc-500">{uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-zinc-500" />
                  <p className="text-sm text-zinc-400">Cliquez pour uploader</p>
                  <p className="text-xs text-zinc-600">ou collez une URL</p>
                </div>
              )}
            </button>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="Ou collez une URL..."
              className={`mt-3 w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus:outline-none`}
            />
          </div>

          {/* Display Options */}
          <div className={`rounded-xl border ${inputBorder} bg-slate-900/30 p-4`}>
            <h3 className={`mb-3 text-sm font-semibold text-zinc-300`}>Affichage</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className={`h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-zinc-300 focus:ring-zinc-500`}
                />
                <span className="text-sm text-zinc-100">Projet à la une</span>
              </label>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Ordre d'affichage</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${inputBorder} bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none`}
                />
                <p className="mt-1 text-xs text-zinc-500">Plus bas = affiché en premier</p>
              </div>
            </div>
          </div>

          {/* Preview Link */}
          {formData.slug && (
            <div className={`rounded-xl border ${inputBorder} bg-slate-900/30 p-4`}>
              <a
                href={`/portfolio#${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm text-zinc-300 hover:text-zinc-400 transition-colors`}
              >
                <Eye className="h-4 w-4" />
                Voir dans le portfolio
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center justify-between border-t ${inputBorder} pt-6`}>
        <button
          type="button"
          onClick={() => setView('projects')}
          className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !formData.title || !formData.description}
          className={`rounded-lg ${buttonPrimary} px-6 py-3 text-sm font-medium text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          <FolderKanban className="h-4 w-4" />
          {isPending ? 'Enregistrement...' : projectId ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </div>
  );
}
