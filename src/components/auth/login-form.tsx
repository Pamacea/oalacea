"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError("Invalid credentials")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-none border-2 border-imperium-crimson bg-imperium-crimson/10 px-4 py-3">
          <p className="font-terminal text-sm text-imperium-crimson">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block font-display text-xs uppercase tracking-wider text-imperium-bone mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          placeholder="votre@email.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block font-display text-xs uppercase tracking-wider text-imperium-bone mb-2">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        variant="crimson"
        className="w-full uppercase font-display tracking-wider"
      >
        {isLoading ? "Connexion..." : "Se Connecter"}
      </Button>
    </form>
  )
}
