"use client";

import { useState } from "react";
import VoiceAssistantPanel from "../components/accessibility/VoiceAssistantPanel";
import DyslexiaLessonPanel from "../components/accessibility/DyslexiaLessonPanel";
import HearingInspirationPanel from "../components/accessibility/HearingInspirationPanel";
import MotionDetectionPanel from "../components/accessibility/MotionDetectionPanel";

const tabs = [
  { id: "voice", label: "Voice Assistant" },
  { id: "dyslexia", label: "Dyslexia Lessons" },
  { id: "hearing", label: "Hearing Content" },
  { id: "motion", label: "Motion Detection" },
];

export default function LearnPage() {
  const [active, setActive] = useState("voice");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Cortex Bridge</p>
          <h1 className="mt-2 text-4xl font-extrabold">Inclusive Learning Studio</h1>
          <p className="mt-3 max-w-3xl text-slate-200">
            One integrated model with voice navigation, dyslexia-first interactive lessons,
            caption-centered inspiration, and motion detection from camera input.
          </p>
        </header>

        <nav className="mt-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="mt-6">
          {active === "voice" && <VoiceAssistantPanel />}
          {active === "dyslexia" && <DyslexiaLessonPanel />}
          {active === "hearing" && <HearingInspirationPanel />}
          {active === "motion" && <MotionDetectionPanel />}
        </section>
      </div>
    </main>
  );
}
