export default function AboutPage() {
  return (
    <div className="min-h-screen bg-imperium-black flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="font-display text-2xl uppercase tracking-wider text-imperium-crimson">
          [ About ]
        </h1>
        <p className="mt-3 font-terminal text-imperium-steel max-w-md mx-auto">
          {'>'} Portfolio & Blog créés avec Next.js 15, Three.js et Prisma.
          <br />
          {'>'} Brutalist design inspired by Warhammer 40K Imperium aesthetic.
        </p>
        <div className="mt-6 flex gap-3 justify-center font-terminal">
          <a href="/projets" className="text-imperium-steel hover:text-imperium-gold transition-colors uppercase">
            [ Projects ]
          </a>
          <a href="/blogs" className="text-imperium-steel hover:text-imperium-gold transition-colors uppercase">
            [ Blog ]
          </a>
        </div>
      </div>
    </div>
  );
}
