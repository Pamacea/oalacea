// AssetLoader - Lazy loading for 3D assets with React Suspense
'use client';

import { Suspense, forwardRef, useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib/loaders/GLTFLoader';
import { TextureLoader } from 'three';
import * as THREE from 'three';

export interface AssetLoaderProps {
  url: string;
  type: 'gltf' | 'glb' | 'texture' | 'audio';
  onLoad?: (object: any) => void;
  onError?: (error: Error) => void;
  priority?: 'high' | 'normal' | 'low';
  placeholder?: React.ReactNode;
  children: (object: any) => React.ReactNode;
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
        let asset: any;

        switch (type) {
          case 'gltf':
          case 'glb':
            asset = await new Promise<void | GLTFLoader>((resolve, reject) => {
              new GLTFLoader(loader).load(
                url,
                (gltf) => resolve(gltf),
                undefined,
                reject
              );
            });
            break;
          case 'texture':
            asset = await new Promise<void | THREE.Texture>((resolve, reject) => {
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
  const gltf = useLoader(GLTFLoader, url);
  return gltf;
}

export function useTexture(url: string) {
  const texture = useLoader(TextureLoader, url);
  return texture;
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
  onLoad?: (object: any) => void;
  children: (object: any, isHighQuality: boolean) => React.ReactNode;
}) {
  const [useHighQuality, setUseHighQuality] = useState(false);
  const [asset, setAsset] = useState<any>(null);

  useEffect(() => {
    const loadLowQuality = async () => {
      try {
        let lowAsset: any;
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
        let highAsset: any;
        if (type === 'texture') {
          highAsset = await new Promise<THREE.Texture>((resolve) => {
            new TextureLoader().load(highQualityUrl, resolve);
          });
        }
        setAsset(highAsset);
        setUseHighQuality(true);
        onLoad?.(highAsset);
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
