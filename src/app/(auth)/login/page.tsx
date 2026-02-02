import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-imperium-black-deep p-4 md:p-8">
      <div className="w-full max-w-3xl border-2 border-imperium-crimson p-6 md:p-12 shadow-[8px_8px_0_rgba(154,17,21,0.3)] bg-imperium-black">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-imperium-crimson mb-2">
            Admin Login
          </h1>
          <p className="font-terminal text-sm text-imperium-steel">
            {'>'} Enter your credentials to access the admin panel
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
