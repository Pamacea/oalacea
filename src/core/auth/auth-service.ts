import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/types/auth"

export interface CreateUserData {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  image?: string
}

export async function createUser(data: CreateUserData) {
  const hashedPassword = await hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || "VIEWER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
    },
  })

  return user
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })
}

export async function updateUser(id: string, data: UpdateUserData) {
  const updateData: Record<string, unknown> = {}

  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email
  if (data.image !== undefined) updateData.image = data.image
  if (data.password) {
    updateData.password = await hash(data.password, 12)
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
    },
  })
}

export async function getAllUsers(filters?: {
  role?: UserRole
  isActive?: boolean
  search?: string
}) {
  const where: Record<string, unknown> = {}

  if (filters?.role) {
    where.role = filters.role
  }

  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function setUserRole(userId: string, role: UserRole) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })
}

export async function setUserActiveStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
  })
}

export async function deleteUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  })
}
