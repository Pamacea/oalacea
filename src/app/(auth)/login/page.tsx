import { LoginForm } from "@/components/auth"

export default function LoginPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the admin panel.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
