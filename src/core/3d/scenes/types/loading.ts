// Loading type definitions

export interface LoadingState {
  progress: number;
  loading: Set<string>;
  loaded: Set<string>;
  errors: Map<string, Error>;
}

export interface AssetDescriptor {
  id: string;
  type: 'gltf' | 'texture' | 'hdr' | 'audio';
  path: string;
  critical: boolean;
}
