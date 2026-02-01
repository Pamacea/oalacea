export default function ContactPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl uppercase tracking-wider text-imperium-crimson">
          [ Contact ]
        </h1>
        <p className="mt-4 font-terminal text-imperium-steel">
          {'>'} Get in touch with us through the channels below.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-none border-2 border-imperium-steel-dark bg-imperium-black p-6 shadow-[4px_4px_0_rgba(148,148,148,0.3)]">
            <h2 className="font-display uppercase tracking-wider text-imperium-gold mb-2">{'>'} Email</h2>
            <p className="font-terminal text-imperium-steel">contact@oalacea.com</p>
          </div>

          <div className="rounded-none border-2 border-imperium-steel-dark bg-imperium-black p-6 shadow-[4px_4px_0_rgba(148,148,148,0.3)]">
            <h2 className="font-display uppercase tracking-wider text-imperium-gold mb-2">{'>'} Social</h2>
            <div className="flex gap-4 font-terminal text-imperium-steel">
              <a href="#" className="hover:text-imperium-crimson transition-colors">GitHub</a>
              <a href="#" className="hover:text-imperium-crimson transition-colors">Twitter</a>
              <a href="#" className="hover:text-imperium-crimson transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
