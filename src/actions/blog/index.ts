// Blog actions - Re-exports
export * from './query';
export * from './crud';
export * from './versions';

// Re-export updatePostWithVersion as updatePost for backward compatibility
export { updatePostWithVersion as updatePost } from './versions';
