"use client"

import { useState, useCallback } from "react"
import {
  Share2 as Share2Icon,
  Link as LinkIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon,
  Facebook as FacebookIcon,
  QrCode as QrCodeIcon,
  MapPin as MapPinIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "../utils"

interface ShareButtonsProps {
  title?: string
  description?: string
  url?: string
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  show3DShare?: boolean
  worldState?: {
    world?: "dev" | "art"
    position?: [number, number, number]
  }
  // Dependencies to inject from app layer
  Button?: React.ComponentType<any>
  DropdownMenu?: React.ComponentType<any>
  DropdownMenuContent?: React.ComponentType<any>
  DropdownMenuItem?: React.ComponentType<any>
  DropdownMenuTrigger?: React.ComponentType<any>
  DropdownMenuSeparator?: React.ComponentType<any>
  DropdownMenuLabel?: React.ComponentType<any>
  Dialog?: React.ComponentType<any>
  DialogContent?: React.ComponentType<any>
  DialogDescription?: React.ComponentType<any>
  DialogHeader?: React.ComponentType<any>
  DialogTitle?: React.ComponentType<any>
  DialogTrigger?: React.ComponentType<any>
}

export function ShareButtons({
  title = "Check this out on Oalacea",
  description,
  url,
  className,
  variant = "outline",
  size = "sm",
  show3DShare = false,
  worldState,
  Button: Button,
  DropdownMenu: DropdownMenu,
  DropdownMenuContent: DropdownMenuContent,
  DropdownMenuItem: DropdownMenuItem,
  DropdownMenuTrigger: DropdownMenuTrigger,
  DropdownMenuSeparator: DropdownMenuSeparator,
  DropdownMenuLabel: DropdownMenuLabel,
  Dialog: Dialog,
  DialogContent: DialogContent,
  DialogDescription: DialogDescription,
  DialogHeader: DialogHeader,
  DialogTitle: DialogTitle,
  DialogTrigger: DialogTrigger,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState<string>("")
  const [qrLoading, setQrLoading] = useState(false)

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")

  const generateQRCode = useCallback(async () => {
    if (qrCode) return
    setQrLoading(true)
    try {
      const QRCode = (await import("qrcode")).default
      const dataUrl = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#d4af37",
          light: "#0a0a0a",
        },
      })
      setQrCode(dataUrl)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    } finally {
      setQrLoading(false)
    }
  }, [shareUrl, qrCode])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title}\n${description || ""}`)
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank")
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank")
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank")
  }

  const share3DState = () => {
    if (!worldState) return

    const params = new URLSearchParams()
    if (worldState.world) params.set("world", worldState.world)
    if (worldState.position) {
      params.set("pos", worldState.position.join(","))
    }

    const stateUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    navigator.clipboard.writeText(stateUrl)
    toast.success("3D state link copied!")
  }

  const canNativeShare = typeof navigator !== "undefined" && navigator.share

  if (!Button) {
    // Fallback for simple button only
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {canNativeShare ? (
          <button
            onClick={handleNativeShare}
            className="gap-2 px-4 py-2 rounded border hover:bg-muted"
          >
            <Share2Icon className="size-4" />
            Share
          </button>
        ) : (
          <button onClick={handleCopy} className="gap-2 px-4 py-2 rounded border hover:bg-muted">
            <CopyIcon className="size-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {canNativeShare && (
        <Button
          variant={variant}
          size={size}
          onClick={handleNativeShare}
          className="gap-2"
        >
          <Share2Icon className="size-4" />
          Share
        </Button>
      )}

      {!canNativeShare && DropdownMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={variant} size={size} className="gap-2">
              <Share2Icon className="size-4" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Share to</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={shareToTwitter} className="gap-2">
              <TwitterIcon className="size-4 text-[#1DA1F2]" />
              <span>Twitter / X</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={shareToLinkedIn} className="gap-2">
              <LinkedinIcon className="size-4 text-[#0077B5]" />
              <span>LinkedIn</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={shareToFacebook} className="gap-2">
              <FacebookIcon className="size-4 text-[#1877F2]" />
              <span>Facebook</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleCopy} className="gap-2">
              {copied ? (
                <CheckIcon className="size-4 text-imperium-terminal" />
              ) : (
                <LinkIcon className="size-4" />
              )}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </DropdownMenuItem>

            {show3DShare && worldState && (
              <DropdownMenuItem onClick={share3DState} className="gap-2">
                <MapPinIcon className="size-4 text-imperium-gold" />
                <span>Copy 3D State</span>
              </DropdownMenuItem>
            )}

            {Dialog && (
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      generateQRCode()
                    }}
                    className="gap-2"
                  >
                    <QrCodeIcon className="size-4" />
                    <span>Show QR Code</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>QR Code</DialogTitle>
                    <DialogDescription>
                      Scan this QR code to visit this page
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    {qrLoading ? (
                      <div className="flex size-64 items-center justify-center rounded-sm border bg-muted">
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : qrCode ? (
                      <div className="rounded-sm border-2 border-imperium-gold p-4">
                        <img
                          src={qrCode}
                          alt="QR Code"
                          className="size-64"
                        />
                      </div>
                    ) : (
                      <div className="flex size-64 items-center justify-center rounded-sm border bg-muted">
                        <QrCodeIcon className="size-12 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{shareUrl}</p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button variant={variant} size={size} onClick={handleCopy}>
        {copied ? (
          <CheckIcon className="size-4 text-imperium-terminal" />
        ) : (
          <CopyIcon className="size-4" />
        )}
      </Button>
    </div>
  )
}

export default ShareButtons
