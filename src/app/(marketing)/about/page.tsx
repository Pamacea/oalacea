export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-2xl font-semibold text-zinc-100">À propos</h1>
        <p className="mt-3 text-zinc-500 max-w-md mx-auto">
          Portfolio & Blog créés avec Next.js 15, Three.js et Prisma.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <a href="/portfolio" className="text-zinc-400 hover:text-zinc-200 transition-colors">
            Portfolio →
          </a>
          <a href="/blog" className="text-zinc-400 hover:text-zinc-200 transition-colors">
            Blog →
          </a>
        </div>
      </div>
    </div>
  );
}
