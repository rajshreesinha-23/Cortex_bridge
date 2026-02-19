"use client";

import { useEffect, useMemo, useState } from "react";

export default function DyslexiaLessonPanel() {
  const [lessons, setLessons] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");
  const [user, setUser] = useState("");
  const [largeText, setLargeText] = useState(true);
  const [wideSpacing, setWideSpacing] = useState(true);
  const [focusLine, setFocusLine] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser") || "";
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLessons = async () => {
      try {
        const res = await fetch("/api/lessons?type=dyslexia");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load lessons");
        if (isMounted) setLessons(data.lessons || []);
      } catch {
        if (isMounted) setLessons([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLessons();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const res = await fetch(`/api/preferences?email=${encodeURIComponent(user)}`);
        const data = await res.json();
        if (!res.ok) return;
        const prefs = data.preferences || {};
        if (!isMounted) return;
        setLargeText(prefs.largeText ?? true);
        setWideSpacing(prefs.wideSpacing ?? true);
        setFocusLine(prefs.focusLine ?? false);
      } catch {
        // no-op
      }
    };

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user, largeText, wideSpacing, focusLine }),
    }).catch(() => {});
  }, [user, largeText, wideSpacing, focusLine]);

  const lesson = lessons[index] || null;

  const className = useMemo(() => {
    const classes = ["rounded-2xl", "bg-amber-50", "p-6", "shadow-sm", "ring-1", "ring-amber-200"];
    if (largeText) classes.push("text-lg");
    if (wideSpacing) classes.push("tracking-wide", "leading-9");
    if (focusLine) classes.push("lesson-focus");
    return classes.join(" ");
  }, [largeText, wideSpacing, focusLine]);

  const check = () => {
    if (!selected || !lesson) return;
    setResult(selected === lesson.answer ? "Correct answer." : "Not quite. Try again.");
  };

  const readLesson = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (!lesson) return;
    const msg = new SpeechSynthesisUtterance(`${lesson.title}. ${lesson.content}`);
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  const nextLesson = () => {
    setSelected("");
    setResult("");
    if (!lessons.length) return;
    setIndex((prev) => (prev + 1) % lessons.length);
  };

  if (loading) {
    return (
      <section className={className}>
        <p className="text-amber-900">Loading dyslexia lessons...</p>
      </section>
    );
  }

  if (!lesson) {
    return (
      <section className={className}>
        <p className="text-amber-900">No lessons available.</p>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-amber-900">Dyslexia Interactive Lessons</h2>
        <button
          onClick={readLesson}
          className="rounded-lg bg-amber-800 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          Read Aloud
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => setLargeText((v) => !v)}
          className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-300"
        >
          Large Text: {largeText ? "On" : "Off"}
        </button>
        <button
          onClick={() => setWideSpacing((v) => !v)}
          className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-300"
        >
          Extra Spacing: {wideSpacing ? "On" : "Off"}
        </button>
        <button
          onClick={() => setFocusLine((v) => !v)}
          className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-300"
        >
          Focus Line: {focusLine ? "On" : "Off"}
        </button>
      </div>

      <article className="mt-5 rounded-xl bg-white p-4 ring-1 ring-amber-100">
        <h3 className="font-bold text-amber-950">{lesson.title}</h3>
        <p className="mt-2 text-amber-900">{lesson.content}</p>
      </article>

      <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-amber-100">
        <p className="font-semibold text-amber-950">{lesson.question}</p>
        <div className="mt-3 space-y-2">
          {lesson.options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-amber-900">
              <input
                type="radio"
                name={`lesson-${lesson.id || "lesson"}`}
                value={option}
                checked={selected === option}
                onChange={(e) => setSelected(e.target.value)}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={check}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Check Answer
          </button>
          <button
            onClick={nextLesson}
            className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
          >
            Next Lesson
          </button>
        </div>
        {result && <p className="mt-3 font-medium text-amber-900">{result}</p>}
      </div>
    </section>
  );
}
