import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Eye, Star, Globe, Skull } from 'lucide-react';
import { getProjects, deleteProjectWithRevalidate } from '@/actions/projects';
import { exportProjects } from '@/actions/projects-export-import';
import { GlitchText } from '@/components/ui/imperium';
import { ExportImportButton } from '@/features/admin/components';

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteProjectWithRevalidate.bind(null, id)}>
      <button
        type="submit"
        className="p-2 text-imperium-steel hover:text-imperium-crimson transition-colors border-2 border-transparent hover:border-imperium-maroon"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

const categoryLabels: Record<string, string> = {
  WEB: 'WEB',
  MOBILE: 'MOBILE',
  THREE_D: '3D',
  AI: 'AI',
  OTHER: 'OTHER',
};

export const dynamic = 'force-dynamic';

interface AdminProjectsPageProps {
  searchParams: Promise<{ world?: 'all' | 'DEV' | 'ART' }>;
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const params = await searchParams;
  const worldFilter = params.world || 'all';
  const projects = await getProjects(worldFilter === 'all' ? {} : { world: worldFilter });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
        <Skull className="w-full h-full text-imperium-gold" />
      </div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-imperium-steel-dark">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-display text-3xl uppercase tracking-widest text-imperium-gold flex items-center gap-3">
              <span className="inline-block w-2 h-2 bg-imperium-gold animate-pulse" />
              <GlitchText intensity="medium">[ FORGE DATABASE ]</GlitchText>
            </h1>
            <p className="font-terminal text-imperium-steel text-sm mt-2 flex items-center gap-2">
              <span className="text-imperium-gold">{'>'}</span>
              <span>{projects.length} BLUEPRINT{projects.length > 1 ? 'S' : ''} REGISTERED</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportImportButton
            type="project"
            exportAction={exportProjects}
            exportFileName="projects-export"
          />
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 font-terminal text-sm font-medium text-imperium-bone border-2 border-imperium-gold bg-imperium-gold text-imperium-black hover:bg-imperium-gold/90 hover:shadow-[4px_4px_0_rgba(212,175,55,0.4)] transition-all"
          >
            <Plus className="h-4 w-4" />
            FORGE NEW
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-imperium-steel-dark bg-imperium-black-deep/30">
          <p className="font-terminal text-imperium-steel-dark mb-4">
            {'>'} {worldFilter === 'all' ? 'NO BLUEPRINTS FOUND' : `NO BLUEPRINTS IN ${worldFilter} WORLD`}
          </p>
          <p className="font-terminal text-xs text-imperium-steel mb-6">Forge database empty. Initiate new blueprint.</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 font-terminal text-sm text-imperium-black border-2 border-imperium-gold bg-imperium-gold hover:bg-imperium-gold/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            INITIALIZE
          </Link>
        </div>
      ) : (
        <div className="border-2 border-imperium-steel-dark bg-imperium-black-deep/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-imperium-black border-b-2 border-imperium-steel-dark">
                <tr>
                  <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Blueprint ]</th>
                  <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Type ]</th>
                  <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ World ]</th>
                  <th className="px-6 py-4 text-left font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Year ]</th>
                  <th className="px-6 py-4 text-right font-terminal text-xs font-medium text-imperium-gold uppercase tracking-wider">[ Actions ]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-imperium-steel-dark">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-imperium-gold/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {project.thumbnail ? (
                          <div className="h-12 w-16 overflow-hidden border-2 border-imperium-steel-dark bg-imperium-black shrink-0 group-hover:border-imperium-gold transition-colors">
                            <Image src={project.thumbnail} alt="" width={64} height={48} className="h-full w-full object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="h-12 w-16 border-2 border-imperium-steel-dark bg-imperium-black flex items-center justify-center shrink-0">
                            <span className="font-terminal text-xs text-imperium-steel-dark">NO_IMG</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-display text-sm uppercase text-imperium-bone group-hover:text-imperium-gold transition-colors">{project.title}</p>
                            {project.featured && <Star className="h-3 w-3 text-imperium-gold" fill={'currentColor'} />}
                          </div>
                          <p className="font-terminal text-xs text-imperium-steel-dark line-clamp-1">/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 font-terminal text-xs font-medium border-2 border-imperium-steel bg-imperium-iron text-imperium-steel">
                        [{categoryLabels[project.category.slug] || project.category.name.toUpperCase()}]
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {project.worldPosition ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 font-terminal text-xs font-medium border-2 ${
                          project.worldPosition.world === 'DEV'
                            ? 'border-imperium-warp bg-imperium-warp/20 text-imperium-warp'
                            : 'border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson'
                        }`}>
                          <Globe className="h-3 w-3" />
                          {project.worldPosition.world}
                        </span>
                      ) : (
                        <span className="font-terminal text-xs text-imperium-steel-dark">[VOID]</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-terminal text-sm text-imperium-steel-dark">{project.year}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/portfolio/${project.slug}`}
                          target="_blank"
                          className="p-2 text-imperium-steel hover:text-imperium-gold border-2 border-transparent hover:border-imperium-gold/30 transition-all"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="p-2 text-imperium-steel hover:text-imperium-crimson border-2 border-transparent hover:border-imperium-crimson/30 transition-all"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton id={project.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
