import Link from 'next/link'
import SceneLoader from '@/components/three/SceneLoader'

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <SceneLoader />

      <nav className="relative z-10 flex items-center justify-between px-8 h-16 border-b border-white/5 backdrop-blur-sm bg-[#050d1a]/60">
        <span style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.1em', fontSize: '1.5rem', color: 'var(--electric)' }}>
          StudyGuy
        </span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm text-[var(--off)] hover:text-white transition-colors">Sign in</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg bg-[var(--electric)] text-[var(--navy)] font-semibold hover:opacity-90 transition-opacity">
            Get started
          </Link>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 py-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--electric)]/30 bg-[var(--electric)]/10 text-[var(--electric)] text-xs font-mono tracking-widest mb-8 uppercase">
          AI-powered study guides
        </div>
        <h1 style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.06em', lineHeight: 1 }}
            className="text-6xl md:text-8xl text-white mb-6">
          Study smarter.<br />
          <span style={{ color: 'var(--electric)' }}>Not harder.</span>
        </h1>
        <p className="text-[var(--off)] text-lg md:text-xl max-w-xl mb-12 font-light leading-relaxed">
          Upload any PDF, Word doc, or textbook page. Get a complete study guide, flashcards, and practice problems in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/login"
            className="px-8 py-3 rounded-xl bg-[var(--electric)] text-[var(--navy)] font-bold hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.1em', fontSize: '1.1rem' }}>
            Start for free
          </Link>
          <Link href="#features"
            className="px-8 py-3 rounded-xl border border-white/15 text-[var(--off)] text-sm hover:border-[var(--electric)]/40 hover:text-white transition-colors">
            See how it works
          </Link>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-5xl mx-auto w-full px-6 pb-32 grid md:grid-cols-3 gap-6">
        {[
          { title: 'Upload anything', body: 'PDFs, DOCX, images — our AI handles them all and extracts what matters.' },
          { title: 'Instant guides',  body: 'Definitions, key points, flashcards, and worked examples generated in seconds.' },
          { title: 'Study your way',  body: 'Study guide, problem solver, or hybrid mode — pick what suits your subject.' },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 hover:border-[var(--electric)]/30 transition-colors">
            <h3 style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.08em', fontSize: '1.3rem', color: 'var(--electric)' }} className="mb-2">
              {f.title}
            </h3>
            <p className="text-[var(--off)] text-sm font-light leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
