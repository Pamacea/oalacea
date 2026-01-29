'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, updateProject } from '@/actions/projects';
import { ProjectCategory } from '@/generated/prisma/enums';
import { X, MapPin } from 'lucide-react';
import { generateSlug } from '@/lib/utils/slug';
import { parseWorldPosition, parseTechStack } from '@/services/contentService';

interface ProjectFormProps {
  project?: any;
}

interface FormErrors {
  title?: string;
  description?: string;
  year?: string;
}

const categoryLabels: Record<ProjectCategory, string> = {
  WEB: 'Web',
  MOBILE: 'Mobile',
  THREE_D: '3D',
  AI: 'IA',
  OTHER: 'Autre',
};

const categories = Object.values(ProjectCategory);

type WorldPosition = {
  world: 'DEV' | 'ART';
  x: number;
  z: number;
  y: number;
  rotation: number;
};

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
  // World position
  world: 'DEV' | 'ART' | '';
  x: string;
  z: string;
  y: string;
  rotation: string;
};

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<FormData>({
    title: project?.title || '',
    slug: project?.slug || '',
    description: project?.description || '',
    longDescription: project?.longDescription || '',
    techStack: project?.techStack?.join(', ') || '',
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    thumbnail: project?.thumbnail || '',
    featured: project?.featured || false,
    sortOrder: project?.sortOrder || 0,
    year: project?.year || new Date().getFullYear(),
    category: project?.category || ProjectCategory.WEB,
    world: project?.worldPosition?.world || '',
    x: project?.worldPosition?.x?.toString() || '0',
    z: project?.worldPosition?.z?.toString() || '0',
    y: project?.worldPosition?.y?.toString() || '0',
    rotation: project?.worldPosition?.rotation?.toString() || '0',
  });

  const validateField = (name: string, value: string) => {
    const newErrors: FormErrors = {};

    if (name === 'title' && !value.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    if (name === 'description' && !value.trim()) {
      newErrors.description = 'La description est requise';
    }
    if (name === 'year' && (!value || isNaN(Number(value)))) {
      newErrors.year = 'L\'année doit être un nombre valide';
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const isValid =
      validateField('title', formData.title) &&
      validateField('description', formData.description) &&
      validateField('year', String(formData.year));

    return isValid;
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const value = String((formData as Record<string, unknown>)[name] || '');
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      const data: any = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        longDescription: formData.longDescription || undefined,
        techStack: parseTechStack(formData.techStack),
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        thumbnail: formData.thumbnail || undefined,
        featured: formData.featured,
        sortOrder: formData.sortOrder,
        year: formData.year,
        category: formData.category,
      };

      const worldPosition = parseWorldPosition(formData);
      if (worldPosition) {
        data.worldPosition = worldPosition;
      }

      if (project) {
        await updateProject(project.id, data);
      } else {
        await createProject(data);
      }
      router.push('/admin/projects');
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

    // Auto-generate slug when title changes
    if (name === 'title' && !project) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-100">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={() => handleBlur('title')}
                  aria-invalid={!!errors.title && touched.title}
                  aria-describedby={errors.title && touched.title ? 'title-error' : undefined}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Mon projet awesome"
                />
                {errors.title && touched.title && (
                  <p id="title-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-zinc-100">
                  Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none font-mono text-sm"
                  placeholder="mon-projet-awesome"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-zinc-100">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 focus:border-zinc-700 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-zinc-100">
                  Année <span className="text-red-500">*</span>
                </label>
                <input
                  id="year"
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  onBlur={() => handleBlur('year')}
                  aria-invalid={!!errors.year && touched.year}
                  aria-describedby={errors.year && touched.year ? 'year-error' : undefined}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {errors.year && touched.year && (
                  <p id="year-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.year}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-zinc-100">
                Description courte <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={() => handleBlur('description')}
                rows={2}
                aria-invalid={!!errors.description && touched.description}
                aria-describedby={errors.description && touched.description ? 'description-error' : undefined}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                placeholder="Une brève description du projet..."
              />
              {errors.description && touched.description && (
                <p id="description-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="longDescription" className="mb-1.5 block text-sm font-medium text-zinc-100">
                Description longue
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none resize-y"
                placeholder="Description détaillée du projet, challenges, solutions..."
              />
            </div>

            <div>
              <label htmlFor="techStack" className="mb-1.5 block text-sm font-medium text-zinc-100">
                Stack technique
              </label>
              <input
                id="techStack"
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none"
                placeholder="React, TypeScript, Tailwind..."
              />
              <p className="mt-1 text-xs text-slate-500">
                Technologies séparées par des virgules
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="githubUrl" className="mb-1.5 block text-sm font-medium text-zinc-100">
                  GitHub
                </label>
                <input
                  id="githubUrl"
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label htmlFor="liveUrl" className="mb-1.5 block text-sm font-medium text-zinc-100">
                  Site en ligne
                </label>
                <input
                  id="liveUrl"
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="font-semibold text-zinc-100">Mise en avant</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-900/50 text-zinc-500 focus:ring-zinc-700"
              />
              <span className="text-sm text-zinc-100">Projets à la une</span>
            </label>

            <div>
              <label htmlFor="sortOrder" className="mb-1.5 block text-sm font-medium text-zinc-100">
                Ordre d'affichage
              </label>
              <input
                id="sortOrder"
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Plus bas = affiché en premier
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
              <MapPin className="h-4 w-4" />
              Position 3D
            </h3>

            <div>
              <label htmlFor="world" className="mb-1.5 block text-sm font-medium text-zinc-100">
                Monde
              </label>
              <select
                id="world"
                name="world"
                value={formData.world}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-100 focus:border-zinc-700 focus:outline-none"
              >
                <option value="">Pas de position</option>
                <option value="DEV">Dev World</option>
                <option value="ART">Art World</option>
              </select>
            </div>

            {formData.world && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="x" className="mb-1 block text-xs font-medium text-zinc-400">
                      X
                    </label>
                    <input
                      id="x"
                      type="number"
                      name="x"
                      value={formData.x}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="z" className="mb-1 block text-xs font-medium text-zinc-400">
                      Z
                    </label>
                    <input
                      id="z"
                      type="number"
                      name="z"
                      value={formData.z}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-700 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="y" className="mb-1 block text-xs font-medium text-zinc-400">
                      Y (hauteur)
                    </label>
                    <input
                      id="y"
                      type="number"
                      name="y"
                      value={formData.y}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="rotation" className="mb-1 block text-xs font-medium text-zinc-400">
                      Rotation
                    </label>
                    <input
                      id="rotation"
                      type="number"
                      name="rotation"
                      value={formData.rotation}
                      onChange={handleChange}
                      step="1"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
            <h3 className="font-semibold text-zinc-100">Miniature</h3>

            <div>
              <input
                type="url"
                name="thumbnail"
                id="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none"
                placeholder="https://..."
              />
              {formData.thumbnail && (
                <div className="mt-3 relative aspect-video rounded-lg overflow-hidden bg-zinc-800">
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, thumbnail: '' }))
                    }
                    className="absolute top-2 right-2 rounded bg-black/50 p-1 text-zinc-100 hover:bg-black/70"
                    aria-label="Remove thumbnail"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:bg-white/5"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-700 px-6 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? 'Enregistrement...'
            : project
            ? 'Mettre à jour'
            : 'Créer'}
        </button>
      </div>
    </form>
  );
}
