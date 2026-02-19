"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProgress, saveProgress } from "../../utils/progressstorage";

export default function Dashboard() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    const u = localStorage.getItem("currentUser");
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    setCheckingSession(false);
  }, [router]);

  // Load progress per user from API, fallback to local cache.
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadProgress = async () => {
      try {
        const res = await fetch(`/api/progress?email=${encodeURIComponent(user)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load progress");
        }

        const serverProgress = data.progress || data;

        if (isMounted) {
          setProgress(serverProgress);
          saveProgress(user, serverProgress);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Could not load progress from backend");
          setProgress(getProgress(user));
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `onboarding_complete_${user}`;
    const complete = localStorage.getItem(key) === "true";
    if (!complete) {
      setShowOnboarding(true);
      setOnboardingStep(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/preferences?email=${encodeURIComponent(user)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.preferences) setPreferences(data.preferences);
      })
      .catch(() => {});
  }, [user]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (checkingSession || !user || !progress) {
    return <p className="p-8">Loading dashboard...</p>;
  }

  const onboardingSteps = [
    {
      title: "Welcome to Cortex Bridge",
      text: "Use this dashboard to track progress and quickly access inclusive learning tools.",
    },
    {
      title: "Use Quick Actions",
      text: "At the bottom, use Speak Page, Voice Command, Captions, Transcript, and Settings shortcuts.",
    },
    {
      title: "Watch Live Status",
      text: "Status chips show Speaking, Listening, Camera, AI, and Sign mode in real time.",
    },
  ];

  const finishOnboarding = () => {
    localStorage.setItem(`onboarding_complete_${user}`, "true");
    setShowOnboarding(false);
  };

  const completionPercent = Math.round((progress.lessonsCompleted / 20) * 100);

  const update = async () => {
    const updated = {
      email: user,
      lessonsCompleted: Math.min(20, progress.lessonsCompleted + 1),
      weeklyConsistency: Math.min(100, progress.weeklyConsistency + 5),
      skillMastery: Math.min(100, progress.skillMastery + 3),
    };

    setProgress(updated);
    saveProgress(user, updated);

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to sync progress");
      }

      const syncedProgress = data.progress || data;
      setProgress(syncedProgress);
      saveProgress(user, syncedProgress);
      setError("");
    } catch (err) {
      setError(err.message || "Progress saved locally but failed to sync");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
      {showOnboarding && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 p-4">
          <div className="mx-auto mt-12 max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Guided Walkthrough
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {onboardingSteps[onboardingStep].title}
            </h2>
            <p className="mt-2 text-slate-600">{onboardingSteps[onboardingStep].text}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-600"
                style={{ width: `${((onboardingStep + 1) / onboardingSteps.length) * 100}%` }}
              />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setOnboardingStep((s) => Math.max(0, s - 1))}
                disabled={onboardingStep === 0}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                Back
              </button>
              {onboardingStep < onboardingSteps.length - 1 ? (
                <button
                  onClick={() => setOnboardingStep((s) => Math.min(onboardingSteps.length - 1, s + 1))}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={finishOnboarding}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Finish
                </button>
              )}
              <button
                onClick={finishOnboarding}
                className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500">Logged in as</p>
            <p className="font-semibold">{user}</p>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
          >
            {dark ? "Light" : "Dark"} Mode
          </button>
        </div>
      </header>

      <section className="px-6 pb-12 md:px-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-600 p-8 text-white shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Progress Report</p>
            <h1 className="mt-2 text-4xl font-extrabold">Your learning dashboard</h1>
            <p className="mt-3 max-w-2xl text-emerald-50">
              Track consistency, mastery, and completed lessons in one place, then continue into
              Inclusive Studio.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={update}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Complete Lesson
              </button>
              <Link
                href="/settings/accessibility"
                className="rounded-xl bg-slate-900/70 px-5 py-3 font-semibold text-white hover:bg-slate-900"
              >
                Accessibility Settings
              </Link>
              <Link
                href="/learn"
                className="rounded-xl border border-white/80 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Open Inclusive Studio
              </Link>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <div className="grid gap-6 md:grid-cols-3">
          <ProgressCard
            title="Lessons Completed"
            value={`${progress.lessonsCompleted}/20`}
            percent={(progress.lessonsCompleted / 20) * 100}
          />
          <ProgressCard
            title="Weekly Consistency"
            value={`${progress.weeklyConsistency}%`}
            percent={progress.weeklyConsistency}
          />
          <ProgressCard
            title="Skill Mastery"
            value={`${progress.skillMastery}%`}
            percent={progress.skillMastery}
          />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold">Overall Completion</h2>
              <p className="font-semibold text-emerald-600">{completionPercent}%</p>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-3 rounded-full bg-emerald-600"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inclusive Studio</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Continue with specialized accessibility modules from your report.
            </p>
            {preferences?.accessibilityNeeds?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Your accessibility profile
                </p>
                <div className="flex flex-wrap gap-2">
                  {preferences.accessibilityNeeds.map((need) => (
                    <span
                      key={need}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    >
                      {formatNeedLabel(need)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <StudioCard
                title="Voice Assistant"
                description="Hands-free voice guidance and spoken responses."
              />
              <StudioCard
                title="Dyslexia Lessons"
                description="Interactive readability-first lesson mode."
              />
              <StudioCard
                title="Hearing Content"
                description="Caption-first inspiration with transcripts."
              />
            </div>
            <Link
              href="/learn"
              className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              Go to Inclusive Studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatNeedLabel(value) {
  return value
    .split("_")
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
    .join(" ");
}

function ProgressCard({ title, value, percent }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h3 className="mb-2 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-green-600 mb-3">
        {value}
      </p>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="h-3 bg-green-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StudioCard({ title, description }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}
