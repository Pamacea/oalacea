'use client';

import { useState, useMemo } from 'react';
import { CodeIcon, CopyIcon, CheckIcon, SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface EmbedOptions {
  slug: string;
  world?: 'dev' | 'art';
  position?: string;
  branding: boolean;
  controls: boolean;
  width: number;
  height: number;
}

interface EmbedCodeGeneratorProps {
  slug: string;
  defaultWorld?: 'dev' | 'art';
  defaultPosition?: string;
}

export function EmbedCodeGenerator({
  slug,
  defaultWorld,
  defaultPosition,
}: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<EmbedOptions>({
    slug,
    world: defaultWorld,
    position: defaultPosition,
    branding: true,
    controls: false,
    width: 800,
    height: 600,
  });

  const embedUrl = useMemo(() => {
    const url = new URL(window.location.origin + `/embed/${slug}`);
    if (options.world) url.searchParams.set('world', options.world);
    if (options.position) url.searchParams.set('pos', options.position);
    if (!options.branding) url.searchParams.set('branding', 'false');
    if (!options.controls) url.searchParams.set('controls', 'false');
    return url.toString();
  }, [slug, options]);

  const iframeCode = useMemo(() => {
    return `<iframe
  src="${embedUrl}"
  width="${options.width}"
  height="${options.height}"
  frameborder="0"
  allowfullscreen
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"
></iframe>`;
  }, [embedUrl, options.width, options.height]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      toast.success('Embed code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePreview = () => {
    window.open(embedUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CodeIcon className="size-4" />
          Embed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            Embed 3D Scene
          </DialogTitle>
          <DialogDescription>
            Customize and generate embed code for this 3D scene
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold">Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="world">World</Label>
              <Select
                value={options.world}
                onValueChange={(value) =>
                  setOptions({ ...options, world: value as 'dev' | 'art' })
                }
              >
                <SelectTrigger id="world">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Dev World</SelectItem>
                  <SelectItem value="art">Art World</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={options.width}
                onChange={(e) =>
                  setOptions({ ...options, width: parseInt(e.target.value) || 800 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={options.height}
                onChange={(e) =>
                  setOptions({ ...options, height: parseInt(e.target.value) || 600 })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="branding">Show Branding</Label>
              <Switch
                id="branding"
                checked={options.branding}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, branding: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="controls">Show Controls</Label>
              <Switch
                id="controls"
                checked={options.controls}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, controls: checked })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Preview</h3>
            <div className="rounded-md border bg-muted/50 p-4">
              <iframe
                src={embedUrl}
                width="100%"
                height="250"
                className="rounded"
                title="Preview"
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handlePreview}
            >
              Open in new tab
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Embed Code</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded bg-black/50 p-3 text-xs text-green-400">
              {iframeCode}
            </pre>
            <Button
              className="mt-3 w-full gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckIcon className="size-4 text-imperium-terminal" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="size-4" />
                  Copy Embed Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export default EmbedCodeGenerator;
