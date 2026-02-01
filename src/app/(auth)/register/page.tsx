export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-imperium-black-deep p-6">
      <div className="w-full max-w-md border-2 border-imperium-gold p-8 shadow-[8px_8px_0_rgba(184,166,70,0.3)] bg-imperium-black">
        <div className="space-y-6">
          <h1 className="font-display text-3xl uppercase tracking-wider text-imperium-gold mb-2">
            Register
          </h1>
          <p className="font-terminal text-sm text-imperium-steel">
            {'>'} Create a new account to begin
          </p>
          <div className="rounded-none border-2 border-imperium-steel-dark p-4">
            <p className="font-terminal text-xs text-imperium-steel-dark">
              Registration is currently disabled. Contact an administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
