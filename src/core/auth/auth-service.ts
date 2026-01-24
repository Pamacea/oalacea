import { type LoginInput, type RegisterInput } from "@/lib/validations"
import type { User } from "@/types"

export async function login(credentials: LoginInput): Promise<User> {
  throw new Error("Not implemented")
}

export async function register(data: RegisterInput): Promise<User> {
  throw new Error("Not implemented")
}

export async function logout(): Promise<void> {
  throw new Error("Not implemented")
}

export async function getCurrentUser(): Promise<User | null> {
  return null
}
