import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#dcfce7_0%,#eff6ff_35%,#ffffff_70%)]">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />

      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <h1 className="text-2xl font-black tracking-tight text-emerald-700">Cortex Bridge</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/70"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-6 md:grid-cols-[1.1fr,0.9fr] md:px-10">
        <div>
          <p className="inline-block rounded-full bg-white px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ring-1 ring-emerald-200">
            Inclusive Intelligence Platform
          </p>
          <h2 className="mt-5 text-5xl font-black leading-tight text-slate-900 md:text-6xl">
            Learning that adapts to every brain and every ability.
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Launch from one beautiful onboarding flow into progress reporting, voice guidance,
            dyslexia-friendly lessons, hearing-first inspiration, and real-time motion interaction.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Start Free
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              View Progress Report
            </Link>
            <Link
              href="/learn"
              className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-white"
            >
              Open Inclusive Studio
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <FeatureCard
            title="Voice Assistant"
            desc="Speech-first coaching with AI replies, read-aloud, and voice input."
            accent="from-emerald-500 to-emerald-700"
          />
          <FeatureCard
            title="Dyslexia Interactive Mode"
            desc="Large text, line focus, spacing controls, and guided checkpoints."
            accent="from-amber-500 to-orange-600"
          />
          <FeatureCard
            title="Hearing-First Learning"
            desc="Caption-first inspiration, transcripts, and sign-language learning overlay."
            accent="from-sky-500 to-sky-700"
          />
          <FeatureCard
            title="Motion + Sign Detection"
            desc="Camera-based movement sensing and sign interpretation for speech-impaired communication."
            accent="from-rose-500 to-rose-700"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc, accent }) {
  return (
    <article className="rounded-2xl bg-white/90 p-5 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${accent}`} />
      <h3 className="mt-3 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </article>
  );
}
