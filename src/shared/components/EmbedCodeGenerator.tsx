"use client"

import { useState, useMemo } from "react"
import {
  Code as CodeIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
} from "lucide-react"
import { toast } from "sonner"

interface EmbedOptions {
  slug: string
  world?: "dev" | "art"
  position?: string
  branding: boolean
  controls: boolean
  width: number
  height: number
}

interface EmbedCodeGeneratorProps {
  slug: string
  defaultWorld?: "dev" | "art"
  defaultPosition?: string
  // Dependencies to inject from app layer
  Button?: React.ComponentType<any>
  Dialog?: React.ComponentType<any>
  DialogContent?: React.ComponentType<any>
  DialogDescription?: React.ComponentType<any>
  DialogHeader?: React.ComponentType<any>
  DialogTitle?: React.ComponentType<any>
  DialogTrigger?: React.ComponentType<any>
  Card?: React.ComponentType<any>
  CardContent?: React.ComponentType<any>
  CardHeader?: React.ComponentType<any>
  CardTitle?: React.ComponentType<any>
  Select?: React.ComponentType<any>
  SelectContent?: React.ComponentType<any>
  SelectItem?: React.ComponentType<any>
  SelectTrigger?: React.ComponentType<any>
  SelectValue?: React.ComponentType<any>
  Switch?: React.ComponentType<any>
  Label?: React.ComponentType<any>
  Input?: React.ComponentType<any>
}

export function EmbedCodeGenerator({
  slug,
  defaultWorld,
  defaultPosition,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Label,
  Input,
}: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [options, setOptions] = useState<EmbedOptions>({
    slug,
    world: defaultWorld,
    position: defaultPosition,
    branding: true,
    controls: false,
    width: 800,
    height: 600,
  })

  const embedUrl = useMemo(() => {
    if (typeof window === "undefined") return ""
    const url = new URL(window.location.origin + `/embed/${slug}`)
    if (options.world) url.searchParams.set("world", options.world)
    if (options.position) url.searchParams.set("pos", options.position)
    if (!options.branding) url.searchParams.set("branding", "false")
    if (!options.controls) url.searchParams.set("controls", "false")
    return url.toString()
  }, [slug, options])

  const iframeCode = useMemo(() => {
    return `<iframe
  src="${embedUrl}"
  width="${options.width}"
  height="${options.height}"
  frameborder="0"
  allowfullscreen
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"
></iframe>`
  }, [embedUrl, options.width, options.height])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode)
      setCopied(true)
      toast.success("Embed code copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handlePreview = () => {
    window.open(embedUrl, "_blank")
  }

  // If UI components aren't provided, render a simplified version
  if (!Dialog || !Button) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm border rounded hover:bg-muted flex items-center gap-2"
        >
          <CodeIcon className="size-4" />
          {copied ? "Copied!" : "Copy Embed Code"}
        </button>
      </div>
    )
  }

  const DialogComponent = Dialog as any
  const DialogTriggerComponent = DialogTrigger as any
  const DialogContentComponent = DialogContent as any
  const DialogHeaderComponent = DialogHeader as any
  const DialogTitleComponent = DialogTitle as any
  const DialogDescriptionComponent = DialogDescription as any

  return (
    <DialogComponent>
      <DialogTriggerComponent asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CodeIcon className="size-4" />
          Embed
        </Button>
      </DialogTriggerComponent>
      <DialogContentComponent className="sm:max-w-2xl">
        <DialogHeaderComponent>
          <DialogTitleComponent className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            Embed 3D Scene
          </DialogTitleComponent>
          <DialogDescriptionComponent>
            Customize and generate embed code for this 3D scene
          </DialogDescriptionComponent>
        </DialogHeaderComponent>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold">Settings</h3>

            {Select && SelectContent && SelectItem && SelectTrigger && SelectValue && Label && (
              <div className="space-y-2">
                <Label htmlFor="world">World</Label>
                <Select
                  value={options.world}
                  onValueChange={(value: string) =>
                    setOptions({ ...options, world: value as "dev" | "art" })
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
            )}

            {Input && Label && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={options.width}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOptions({ ...options, height: parseInt(e.target.value) || 600 })
                    }
                  />
                </div>
              </>
            )}

            {Switch && Label && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="branding">Show Branding</Label>
                  <Switch
                    id="branding"
                    checked={options.branding}
                    onCheckedChange={(checked: boolean) =>
                      setOptions({ ...options, branding: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="controls">Show Controls</Label>
                  <Switch
                    id="controls"
                    checked={options.controls}
                    onCheckedChange={(checked: boolean) =>
                      setOptions({ ...options, controls: checked })
                    }
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Preview</h3>
            <div className="rounded-sm border bg-muted/50 p-4">
              <iframe
                src={embedUrl}
                width="100%"
                height="250"
                className="rounded"
                title="Preview"
              />
            </div>

            {Button && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePreview}
              >
                Open in new tab
              </Button>
            )}
          </div>
        </div>

        {Card && CardContent && CardHeader && CardTitle && (
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
        )}
      </DialogContentComponent>
    </DialogComponent>
  )
}

export default EmbedCodeGenerator
