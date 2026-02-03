import { z } from "zod"

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  published: z.boolean().default(false),
  categoryId: z.string().uuid().optional(),
  coverImage: z.string().url().or(z.literal('')).optional(),
  slug: z.string().optional(),
})

export const postVersionSchema = z.object({
  changeNote: z.string().max(500).optional(),
})

export type PostInput = z.infer<typeof postSchema>

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
})

export type ContactInput = z.infer<typeof contactSchema>

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export type RegisterInput = z.infer<typeof registerSchema>

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  longDescription: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  featured: z.boolean().default(false),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const commentSchema = z.object({
  authorName: z.string().min(1, "Name is required").max(100, "Name too long"),
  authorEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  content: z.string().min(3, "Comment must be at least 3 characters").max(2000, "Comment too long"),
  postId: z.string().optional(),
  projectId: z.string().optional(),
  parentId: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the comment policy",
  }),
})

export type CommentInput = z.infer<typeof commentSchema>

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().max(50).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to receive emails",
  }),
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

export const shareCardSchema = z.object({
  type: z.enum(["blog", "project", "profile"]),
  title: z.string().max(100),
  description: z.string().max(200).optional(),
  imageUrl: z.string().url().optional(),
  theme: z.enum(["imperium", "underground"]).default("imperium"),
})

export type ShareCardInput = z.infer<typeof shareCardSchema>

export const collaborativeCommentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(2000, "Comment too long"),
  entityType: z.enum(["Post", "Project", "Version"]),
  entityId: z.string().cuid(),
  mentions: z.array(z.string().cuid()).optional(),
})

export type CollaborativeCommentInput = z.infer<typeof collaborativeCommentSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.string().datetime().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
