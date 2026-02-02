'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareCardPreviewProps {
  type: 'blog' | 'project' | 'profile';
  slug?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  theme?: 'imperium' | 'underground';
  onChangeTheme?: (theme: 'imperium' | 'underground') => void;
}

export function ShareCardPreview({
  type,
  slug,
  theme = 'imperium',
  onChangeTheme,
}: Omit<ShareCardPreviewProps, 'title' | 'description' | 'imageUrl'>) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cardUrl = useMemo(() => {
    if (!slug) return '';

    const baseUrl = '/api/share-card';
    const params = new URLSearchParams({
      type,
      slug,
      theme,
      v: refreshKey.toString(),
    });
    return `${baseUrl}?${params.toString()}`;
  }, [type, slug, theme, refreshKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRefreshKey(Date.now());
      setIsLoading(false);
      setImageError(false);
    }, 100);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(cardUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${slug || 'share-card'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download share card:', error);
    }
  };

  return (
    <Card variant="steel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display uppercase tracking-wider text-imperium-crimson">
            [ Share Card Preview ]
          </CardTitle>
          <div className="flex items-center gap-2">
            {onChangeTheme && (
              <Select value={theme} onValueChange={onChangeTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperium">Imperium</SelectItem>
                  <SelectItem value="underground">Underground</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('size-4', isLoading && 'animate-spin text-imperium-gold')} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              disabled={!cardUrl || isLoading}
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-none border-2 border-imperium-steel-dark bg-imperium-black">
          {cardUrl && !isLoading ? (
            <Image
              src={cardUrl}
              alt="Share card preview"
              width={1200}
              height={630}
              className="h-full w-full object-contain"
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
              onLoad={() => setIsLoading(false)}
              unoptimized
            />
          ) : imageError ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-imperium-steel-dark">
              <ImageIcon className="size-12" />
              <p className="font-terminal">Failed to load preview</p>
              <Button variant="primary" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="size-8 animate-spin text-imperium-gold" />
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2 font-terminal text-sm text-imperium-steel-dark">
          <p>
            <span className="text-imperium-bone">{'>'} OG URL:</span> {cardUrl}
          </p>
          <p className="text-xs">
            {'>'} Share cards are automatically generated and cached. Use the refresh button to regenerate after making changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShareCardPreview;
