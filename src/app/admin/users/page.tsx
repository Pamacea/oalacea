import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/core/auth"
import { redirect } from "next/navigation"
import { requirePermission } from "@/lib/rbac"
import { UsersTable } from "@/components/admin/UsersTable"

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          createdPosts: true,
          createdProjects: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return users
}

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  try {
    requirePermission(session.user.role, "users:read")
  } catch {
    redirect("/admin")
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p className="text-slate-500">Manage user accounts and permissions</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable users={users} />
      </Suspense>
    </div>
  )
}
