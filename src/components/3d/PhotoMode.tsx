'use client';

import { useState } from 'react';
import { useXRStore, Screenshot } from '@/store/xr-store';
import { Button } from '@/components/ui/button';

interface PhotoModeProps {
  enabled?: boolean;
  onCapture?: (screenshot: Screenshot) => void;
}

type FilterType = 'none' | 'vignette' | 'bloom' | 'sepia' | 'noir';
type ResolutionType = '1080p' | '4K';

/**
 * PhotoMode - UI component that renders OUTSIDE Canvas
 * All 3D capture logic is handled by PhotoModeScene inside Canvas
 */
export function PhotoMode({ enabled = false, onCapture }: PhotoModeProps) {
  const photoModeEnabled = useXRStore((s) => s.photoModeEnabled);
  const screenshots = useXRStore((s) => s.screenshots);
  const flash = useXRStore((s) => s.flash);
  const handleCapture = useXRStore((s) => s.handleCapture);
  const setPhotoModeEnabled = useXRStore((s) => s.setPhotoModeEnabled);

  const [currentFilter, setCurrentFilter] = useState<FilterType>('none');
  const [currentResolution, setCurrentResolution] = useState<ResolutionType>('1080p');
  const [showGallery, setShowGallery] = useState(false);

  const handleShare = async (screenshot: Screenshot) => {
    const blob = await (await fetch(screenshot.dataUrl)).blob();
    const file = new File([blob], `screenshot-${screenshot.timestamp}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Oalacea Screenshot',
          text: 'Check out this screenshot from Oalacea 3D Portfolio',
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (!enabled) return null;

  return (
    <>
      {photoModeEnabled && (
        <>
          <PhotoModeFilters currentFilter={currentFilter} />

          {flash && (
            <div className="fixed inset-0 bg-white pointer-events-none z-50 transition-opacity duration-150" style={{ opacity: flash ? 0.8 : 0 }} />
          )}

          <div className="fixed top-20 right-4 z-40 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 text-white w-64">
            <h3 className="text-sm font-semibold mb-3 text-amber-400">Photo Mode</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Filter</label>
                <select
                  value={currentFilter}
                  onChange={(e) => setCurrentFilter(e.target.value as FilterType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                >
                  <option value="none">None</option>
                  <option value="vignette">Vignette</option>
                  <option value="bloom">Bloom</option>
                  <option value="sepia">Sepia</option>
                  <option value="noir">Noir</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Resolution</label>
                <select
                  value={currentResolution}
                  onChange={(e) => setCurrentResolution(e.target.value as ResolutionType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                >
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>

              <Button
                onClick={() => handleCapture?.()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                Capture (P)
              </Button>

              <Button
                onClick={() => setShowGallery(!showGallery)}
                variant="secondary"
                className="w-full"
              >
                Gallery ({screenshots.length})
              </Button>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                <p>WASD - Move</p>
                <p>Space/Shift - Up/Down</p>
                <p>Mouse - Look around</p>
              </div>
            </div>
          </div>

          {showGallery && (
            <ScreenshotGallery
              screenshots={screenshots}
              onClose={() => setShowGallery(false)}
              onShare={handleShare}
              onDelete={(id) => useXRStore.getState().removeScreenshot(id)}
            />
          )}
        </>
      )}

      <PhotoModeButton />
    </>
  );
}

function PhotoModeButton() {
  const photoModeEnabled = useXRStore((s) => s.photoModeEnabled);
  const setPhotoModeEnabled = useXRStore((s) => s.setPhotoModeEnabled);

  return (
    <button
      onClick={() => setPhotoModeEnabled(!photoModeEnabled)}
      className="fixed top-20 left-4 z-40 bg-slate-900/90 backdrop-blur-sm hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-700"
    >
      {photoModeEnabled ? 'Exit Photo Mode' : 'Photo Mode'}
    </button>
  );
}

interface PhotoModeFiltersProps {
  currentFilter: FilterType;
}

function PhotoModeFilters({ currentFilter }: PhotoModeFiltersProps) {
  return (
    <>
      {currentFilter === 'vignette' && (
        <div className="fixed inset-0 pointer-events-none z-30" style={{
          background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 100%)'
        }} />
      )}

      {currentFilter === 'sepia' && (
        <div className="fixed inset-0 pointer-events-none z-30" style={{
          filter: 'sepia(0.8)'
        }} />
      )}

      {currentFilter === 'noir' && (
        <div className="fixed inset-0 pointer-events-none z-30" style={{
          filter: 'grayscale(100%) contrast(1.2)'
        }} />
      )}
    </>
  );
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  onClose: () => void;
  onShare: (screenshot: Screenshot) => void;
  onDelete: (id: string) => void;
}

function ScreenshotGallery({ screenshots, onClose, onShare, onDelete }: ScreenshotGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Screenshot Gallery</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(screenshot)}
            >
              <img
                src={screenshot.dataUrl}
                alt={`Screenshot ${screenshot.timestamp}`}
                className="w-full h-auto rounded border-2 border-transparent group-hover:border-amber-500 transition-colors"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(screenshot);
                  }}
                  className="p-2 bg-amber-600 hover:bg-amber-700 rounded"
                  title="Share"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(screenshot.id);
                  }}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(screenshot.timestamp).toLocaleString()}
              </div>
            </div>
          ))}

          {screenshots.length === 0 && (
            <div className="col-span-3 text-center py-8 text-slate-400">
              No screenshots yet. Press P or click Capture to take one.
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.dataUrl}
            alt="Full size screenshot"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export { PhotoModeScene } from './PhotoModeScene';
