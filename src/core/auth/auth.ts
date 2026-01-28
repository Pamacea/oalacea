import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
            isActive: true,
          },
        })

        if (!user || !user.password || !user.isActive) {
          return null
        }

        const isValidPassword = await compare(password, user.password)
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isAdmin: user.role === 'ADMIN',
        }
      },
    }),
    ...authConfig.providers,
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isAdmin = token.role === 'ADMIN'
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      if (account?.provider === "credentials") {
        return true
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        if (!existingUser.isActive) return false
        user.id = existingUser.id
        user.role = existingUser.role
        return true
      }

      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: new Date(),
          role: "VIEWER",
        },
      })

      user.id = newUser.id
      user.role = newUser.role
      return true
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
    },
  },
})
