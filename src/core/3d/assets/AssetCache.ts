// AssetCache - IndexedDB caching for 3D assets
'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AssetCacheDB extends DBSchema {
  assets: {
    key: string;
    value: {
      url: string;
      data: Blob;
      type: string;
      timestamp: number;
      version: string;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'oalacea-asset-cache';
const DB_VERSION = 1;
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class AssetCacheClass {
  private db: IDBPDatabase<AssetCacheDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.db = await openDB<AssetCacheDB>(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('assets')) {
              const store = db.createObjectStore('assets', { keyPath: 'url' });
              store.createIndex('by-timestamp', 'timestamp');
            }
          },
        });
        await this.cleanExpired();
      } catch (error) {
        console.error('[AssetCache] Failed to initialize:', error);
        this.db = null;
      }
    })();

    return this.initPromise;
  }

  private getKey(url: string, version: string = 'default'): string {
    return `${version}:${url}`;
  }

  async cleanExpired(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const tx = this.db.transaction('assets', 'readwrite');
    const index = tx.store.index('by-timestamp');
    const cutoffTime = Date.now() - CACHE_EXPIRY_MS;

    let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoffTime));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }

  async get(url: string, version: string = 'default'): Promise<Blob | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const key = this.getKey(url, version);
      const record = await this.db.get('assets', key);

      if (!record) return null;

      const isExpired = Date.now() - record.timestamp > CACHE_EXPIRY_MS;
      if (isExpired) {
        await this.db.delete('assets', key);
        return null;
      }

      return record.data;
    } catch (error) {
      console.error('[AssetCache] Failed to get asset:', error);
      return null;
    }
  }

  async set(
    url: string,
    data: Blob,
    type: string,
    version: string = 'default'
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      const key = this.getKey(url, version);
      await this.db.put('assets', {
        url: key,
        data,
        type,
        timestamp: Date.now(),
        version,
      });
    } catch (error) {
      console.error('[AssetCache] Failed to cache asset:', error);
    }
  }

  async has(url: string, version: string = 'default'): Promise<boolean> {
    const cached = await this.get(url, version);
    return cached !== null;
  }

  async delete(url: string, version: string = 'default'): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      const key = this.getKey(url, version);
      await this.db.delete('assets', key);
    } catch (error) {
      console.error('[AssetCache] Failed to delete asset:', error);
    }
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.clear('assets');
    } catch (error) {
      console.error('[AssetCache] Failed to clear cache:', error);
    }
  }

  async getSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    try {
      const assets = await this.db.getAll('assets');
      return assets.reduce((total, asset) => total + asset.data.size, 0);
    } catch (error) {
      console.error('[AssetCache] Failed to get cache size:', error);
      return 0;
    }
  }

  async getStats(): Promise<{ count: number; size: number }> {
    await this.init();
    if (!this.db) return { count: 0, size: 0 };

    try {
      const assets = await this.db.getAll('assets');
      const size = assets.reduce((total, asset) => total + asset.data.size, 0);
      return { count: assets.length, size };
    } catch (error) {
      console.error('[AssetCache] Failed to get stats:', error);
      return { count: 0, size: 0 };
    }
  }
}

export const AssetCache = new AssetCacheClass();

export async function fetchWithCache(
  url: string,
  type: string,
  version: string = 'default'
): Promise<Blob> {
  const cached = await AssetCache.get(url, version);
  if (cached) {
    console.log(`[AssetCache] Cache hit: ${url}`);
    return cached;
  }

  console.log(`[AssetCache] Cache miss, fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${response.statusText}`);
  }

  const blob = await response.blob();
  await AssetCache.set(url, blob, type, version);
  return blob;
}

export function getObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

export async function loadTextureWithCache(
  url: string,
  version: string = 'default'
): Promise<string> {
  const blob = await fetchWithCache(url, 'texture', version);
  return getObjectURL(blob);
}

export default AssetCache;
