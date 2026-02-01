import { BrutalBackground } from "@/components/navigation/BrutalBackground"
import { FloatingNav } from "@/components/navigation/FloatingNav"
import { WeaponEffects } from "@/components/effects/WeaponEffects"

export default function MieLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BrutalBackground />
      <WeaponEffects />
      <main className="min-h-[80vh] pb-40 pt-8 relative z-10">
        {children}
      </main>
      <FloatingNav />
    </>
  )
}
