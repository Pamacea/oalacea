// Re-export from src/actions/blog for feature encapsulation
export * from '@/actions/blog'

// Comments actions (shared with blog)
export { getComments, createComment } from '@/actions/comments'
