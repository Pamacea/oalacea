import { type PostInput } from "@/lib/validations"
import type { Post, PostListItem } from "@/types"

export async function getPosts(limit = 10): Promise<PostListItem[]> {
  return []
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return null
}

export async function createPost(data: PostInput): Promise<Post> {
  throw new Error("Not implemented")
}

export async function updatePost(id: string, data: Partial<PostInput>): Promise<Post> {
  throw new Error("Not implemented")
}

export async function deletePost(id: string): Promise<void> {
  throw new Error("Not implemented")
}
