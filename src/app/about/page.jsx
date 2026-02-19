import React from "react";

const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-slate-950 text-white px-8 py-16">
      
      {/* Title */}
      <h1 className="text-5xl font-bold tracking-tight">
        About CortexBridge AI
      </h1>

      <p className="mt-4 text-lg text-zinc-400 max-w-3xl">
        CortexBridge is an inclusive multimodal learning engine designed to
        transform education into an adaptive experience for every learner —
        regardless of ability, disability, or learning style.
      </p>

      {/* Mission Section */}
      <div className="mt-12 bg-zinc-900 p-8 rounded-2xl shadow-xl max-w-4xl">
        <h2 className="text-2xl font-semibold text-blue-400">
          🚀 Our Mission
        </h2>

        <p className="mt-4 text-zinc-300 leading-relaxed">
          Traditional educational platforms follow a one-size-fits-all approach.
          CortexBridge breaks that barrier by dynamically converting the same
          learning content into multiple accessible formats — including audio,
          captions, simplified visuals, dyslexia-friendly layouts, and ADHD focus
          modes.
        </p>
      </div>

      {/* Features Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700">
          <h3 className="text-xl font-semibold text-green-400">
            👁️ Vision Accessibility
          </h3>
          <p className="mt-2 text-zinc-400">
            Converts lessons into speech-first formats, screen-reader friendly
            modules, and audio learning experiences.
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700">
          <h3 className="text-xl font-semibold text-purple-400">
            📖 Dyslexia Support
          </h3>
          <p className="mt-2 text-zinc-400">
            Provides spacing-enhanced typography, simplified structure, and
            read-aloud tools for better comprehension.
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700">
          <h3 className="text-xl font-semibold text-blue-400">
            🦻 Hearing Adaptation
          </h3>
          <p className="mt-2 text-zinc-400">
            Real-time captioning and sign-language assistance to ensure learning
            is never missed.
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700">
          <h3 className="text-xl font-semibold text-orange-400">
            🧠 ADHD Focus Mode
          </h3>
          <p className="mt-2 text-zinc-400">
            Breaks content into digestible chunks, highlights key points, and
            reduces cognitive overload.
          </p>
        </div>
      </div>

      {/* Closing */}
      <div className="mt-16 max-w-4xl">
        <p className="text-lg text-zinc-300">
          CortexBridge isn’t just a tool — it’s a bridge between knowledge and
          accessibility, ensuring every student can learn in the way their brain
          understands best.
        </p>

        <p className="mt-4 text-zinc-500 italic">
          “One lesson. Infinite accessibility.”
        </p>
      </div>
    </div>
  );
};

export default page;
