// NOTE: Query hooks have been consolidated in queries/ folder
// Import from @/features/blog/queries instead
export { usePostsClient } from './usePosts';
export { useBlogDocuments } from './useBlogDocuments';

// Re-export canonical query hooks for convenience
export { usePosts, usePost, useCategories } from '../queries'
