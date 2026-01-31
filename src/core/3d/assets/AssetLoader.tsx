// AssetLoader - Lazy loading for 3D assets with React Suspense
'use client';

import { Suspense, forwardRef, useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import type { AnimationClip, Camera, Group } from 'three';

// GLTF type definition (from three-stdlib GLTFLoader)
export interface GLTF {
  animations: AnimationClip[];
  scene: Group;
  scenes: Group[];
  cameras: Camera[];
  asset: {
    copyright?: string;
    generator?: string;
    version?: string;
    minVersion?: string;
    extensions?: any;
    extras?: any;
  };
  parser: any;
  userData: Record<string, any>;
}

type AssetType = 'gltf' | 'glb' | 'texture' | 'audio';

export interface AssetLoaderProps {
  url: string;
  type: AssetType;
  onLoad?: (object: GLTF | THREE.Texture) => void;
  onError?: (error: Error) => void;
  priority?: 'high' | 'normal' | 'low';
  placeholder?: React.ReactNode;
  children: (object: GLTF | THREE.Texture | null) => React.ReactNode;
}

interface LoadingState {
  progress: number;
  loaded: boolean;
  error: Error | null;
}

function AssetLoaderContent({
  url,
  type,
  onLoad,
  onError,
  children,
}: Omit<AssetLoaderProps, 'placeholder' | 'priority'>) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    progress: 0,
    loaded: false,
    error: null,
  });

  useEffect(() => {
    const loader = new THREE.LoadingManager();

    loader.onProgress = (url, loaded, total) => {
      setLoadingState((prev) => ({
        ...prev,
        progress: (loaded / total) * 100,
      }));
    };

    loader.onLoad = () => {
      setLoadingState((prev) => ({ ...prev, loaded: true }));
    };

    loader.onError = (url) => {
      const error = new Error(`Failed to load asset: ${url}`);
      setLoadingState((prev) => ({ ...prev, error }));
      onError?.(error);
    };

    const loadAsset = async () => {
      try {
        let asset: GLTF | THREE.Texture;

        switch (type) {
          case 'gltf':
          case 'glb': {
            // @ts-ignore - three-stdlib dynamic import
            const { GLTFLoader } = await import('three-stdlib/loaders/GLTFLoader');
            asset = await new Promise<GLTF>((resolve, reject) => {
              new GLTFLoader(loader).load(
                url,
                (gltf: GLTF) => resolve(gltf),
                undefined,
                reject
              );
            });
            break;
          }
          case 'texture':
            asset = await new Promise<THREE.Texture>((resolve, reject) => {
              new TextureLoader(loader).load(
                url,
                (texture) => resolve(texture),
                undefined,
                reject
              );
            });
            break;
          default:
            throw new Error(`Unsupported asset type: ${type}`);
        }

        onLoad?.(asset);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setLoadingState((prev) => ({ ...prev, error: err }));
        onError?.(err);
      }
    };

    loadAsset();
  }, [url, type, onLoad, onError]);

  if (loadingState.error) {
    return null;
  }

  if (!loadingState.loaded) {
    return null;
  }

  return <>{children(null)}</>;
}

export function AssetLoader({
  url,
  type,
  onLoad,
  onError,
  priority = 'normal',
  placeholder,
  children,
}: AssetLoaderProps) {
  const [isVisible, setIsVisible] = useState(priority === 'high');

  useEffect(() => {
    if (priority === 'high') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    const target = document.getElementById(`asset-loader-${url}`);
    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [url, priority]);

  if (!isVisible) {
    return (
      <div id={`asset-loader-${url}`} className="asset-placeholder">
        {placeholder}
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        placeholder || (
          <div className="flex items-center justify-center h-32 w-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        )
      }
    >
      <AssetLoaderContent
        url={url}
        type={type}
        onLoad={onLoad}
        onError={onError}
      >
        {children}
      </AssetLoaderContent>
    </Suspense>
  );
}

export function useGLTF(url: string) {
  // @ts-ignore - three-stdlib dynamic import
  const gltf = useLoader((await import('three-stdlib/loaders/GLTFLoader')).GLTFLoader, url);
  return gltf as GLTF;
}

export function useTexture(url: string) {
  const texture = useLoader(TextureLoader, url);
  return texture as THREE.Texture;
}

export function ProgressiveAsset({
  lowQualityUrl,
  highQualityUrl,
  type,
  onLoad,
  children,
}: {
  lowQualityUrl: string;
  highQualityUrl: string;
  type: 'gltf' | 'glb' | 'texture';
  onLoad?: (object: THREE.Texture) => void;
  children: (object: THREE.Texture | null, isHighQuality: boolean) => React.ReactNode;
}) {
  const [useHighQuality, setUseHighQuality] = useState(false);
  const [asset, setAsset] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loadLowQuality = async () => {
      try {
        let lowAsset: THREE.Texture | null = null;
        if (type === 'texture') {
          lowAsset = await new Promise<THREE.Texture>((resolve) => {
            new TextureLoader().load(lowQualityUrl, resolve);
          });
        }
        setAsset(lowAsset);
      } catch (error) {
        console.error('Failed to load low quality asset:', error);
      }
    };

    loadLowQuality();

    const loadHighQuality = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let highAsset: THREE.Texture | null = null;
        if (type === 'texture') {
          highAsset = await new Promise<THREE.Texture>((resolve) => {
            new TextureLoader().load(highQualityUrl, resolve);
          });
        }
        if (highAsset) {
          setAsset(highAsset);
          setUseHighQuality(true);
          onLoad?.(highAsset);
        }
      } catch (error) {
        console.error('Failed to load high quality asset:', error);
      }
    };

    const timeoutId = setTimeout(loadHighQuality, 500);
    return () => clearTimeout(timeoutId);
  }, [lowQualityUrl, highQualityUrl, type, onLoad]);

  if (!asset) return null;

  return <>{children(asset, useHighQuality)}</>;
}

export default AssetLoader;
