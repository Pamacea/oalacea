'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share2Icon,
  LinkIcon,
  CopyIcon,
  CheckIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
  QrCodeIcon,
  MapPinIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode';

interface ShareButtonsProps {
  title?: string;
  description?: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  show3DShare?: boolean;
  worldState?: {
    world?: 'dev' | 'art';
    position?: [number, number, number];
  };
}

export function ShareButtons({
  title = 'Check this out on Oalacea',
  description,
  url,
  className,
  variant = 'outline',
  size = 'sm',
  show3DShare = false,
  worldState,
}: ShareButtonsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const generateQRCode = useCallback(async () => {
    if (qrCode) return;
    setQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#d4af37',
          light: '#0a0a0a',
        },
      });
      setQrCode(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setQrLoading(false);
    }
  }, [shareUrl, qrCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title}\n${description || ''}`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const share3DState = () => {
    if (!worldState) return;

    const params = new URLSearchParams();
    if (worldState.world) params.set('world', worldState.world);
    if (worldState.position) {
      params.set('pos', worldState.position.join(','));
    }

    const stateUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(stateUrl);
    toast.success('3D state link copied!');
  };

  const canNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <div className={cn('flex items-center gap-2', className)}>
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

      {!canNativeShare && (
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
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </DropdownMenuItem>

            {show3DShare && worldState && (
              <DropdownMenuItem onClick={share3DState} className="gap-2">
                <MapPinIcon className="size-4 text-imperium-gold" />
                <span>Copy 3D State</span>
              </DropdownMenuItem>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    generateQRCode();
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
                    <div className="flex size-64 items-center justify-center rounded-lg border bg-muted">
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : qrCode ? (
                    <div className="rounded-lg border-2 border-imperium-gold p-4">
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="size-64"
                      />
                    </div>
                  ) : (
                    <div className="flex size-64 items-center justify-center rounded-lg border bg-muted">
                      <QrCodeIcon className="size-12 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{shareUrl}</p>
                </div>
              </DialogContent>
            </Dialog>
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
  );
}

export default ShareButtons;
