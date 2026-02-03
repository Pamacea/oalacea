"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        signIn("credentials", {
          email: form.state.values.email,
          password: form.state.values.password,
          redirect: false,
        }).then((result) => {
          setIsLoading(false)

          if (result?.error) {
            setError("Invalid credentials")
          } else {
            router.push("/")
            router.refresh()
          }
        })
      }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-none border-2 border-imperium-crimson bg-imperium-crimson/10 px-4 py-3">
          <p className="font-terminal text-sm text-imperium-crimson">{error}</p>
        </div>
      )}

      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) =>
            value.length > 0 ? undefined : "Email is required",
          onChangeAsync: async ({ value }) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return "Invalid email address"
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <div>
            <label htmlFor="email" className="block font-display text-xs uppercase tracking-wider text-imperium-bone mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
              placeholder="votre@email.com"
            />
            {field.state.meta.errors && (
              <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            value.length > 0 ? undefined : "Password is required",
          onChangeAsync: async ({ value }) => {
            if (value.length < 8) return "Password must be at least 8 characters"
            return undefined
          },
        }}
      >
        {(field) => (
          <div>
            <label htmlFor="password" className="block font-display text-xs uppercase tracking-wider text-imperium-bone mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
              placeholder="••••••••"
            />
            {field.state.meta.errors && (
              <p className="mt-1 font-terminal text-xs text-imperium-crimson">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <Button
        type="submit"
        disabled={isLoading}
        variant="primary"
        className="w-full uppercase font-display tracking-wider"
      >
        {isLoading ? "Connexion..." : "Se Connecter"}
      </Button>
    </form>
  )
}
