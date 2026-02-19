"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NEED_OPTIONS = [
  { id: "low_vision", label: "Low Vision Support" },
  { id: "hearing_support", label: "Hearing Support" },
  { id: "dyslexia_support", label: "Dyslexia Support" },
  { id: "speech_support", label: "Speech Support" },
  { id: "motor_support", label: "Motor Support" },
];

const DEFAULT_PREFS = {
  largeText: true,
  wideSpacing: true,
  focusLine: false,
  captionsEnabled: true,
  transcriptVisible: true,
  voiceAutoSpeak: false,
  accessibilityNeeds: [],
};

export default function AccessibilitySettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    fetch(`/api/preferences?email=${encodeURIComponent(currentUser)}`)
      .then((res) => res.json())
      .then((data) => {
        const serverPrefs = data?.preferences || {};
        setPrefs((prev) => ({ ...prev, ...serverPrefs }));
      })
      .catch(() => {
        setStatus("Could not load saved preferences. Showing defaults.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const toggleNeed = (id) => {
    setPrefs((prev) => {
      const current = prev.accessibilityNeeds || [];
      const nextNeeds = current.includes(id)
        ? current.filter((n) => n !== id)
        : [...current, id];
      return { ...prev, accessibilityNeeds: nextNeeds };
    });
  };

  const toggleFlag = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setStatus("");

    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user, ...prefs }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save preferences");
      }
      setStatus("Accessibility settings saved.");
    } catch (err) {
      setStatus(err.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-8">Loading settings...</p>;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Signed in as {user}</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Accessibility Settings</h1>
          <p className="mt-2 text-slate-600">
            Manage your support profile and adaptive features for Inclusive Studio.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Support Profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose the support types you want enabled in your experience.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {NEED_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={(prefs.accessibilityNeeds || []).includes(option.id)}
                  onChange={() => toggleNeed(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Feature Toggles</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Toggle
              label="Large Text"
              value={prefs.largeText}
              onChange={() => toggleFlag("largeText")}
            />
            <Toggle
              label="Wide Spacing"
              value={prefs.wideSpacing}
              onChange={() => toggleFlag("wideSpacing")}
            />
            <Toggle
              label="Focus Line"
              value={prefs.focusLine}
              onChange={() => toggleFlag("focusLine")}
            />
            <Toggle
              label="Captions Enabled"
              value={prefs.captionsEnabled}
              onChange={() => toggleFlag("captionsEnabled")}
            />
            <Toggle
              label="Transcript Visible"
              value={prefs.transcriptVisible}
              onChange={() => toggleFlag("transcriptVisible")}
            />
            <Toggle
              label="Voice Auto Speak"
              value={prefs.voiceAutoSpeak}
              onChange={() => toggleFlag("voiceAutoSpeak")}
            />
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-white"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/learn"
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-white"
          >
            Open Inclusive Studio
          </Link>
        </section>

        {status && <p className="rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm">{status}</p>}
      </div>
    </main>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
    >
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          value ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
        }`}
      >
        {value ? "On" : "Off"}
      </span>
    </button>
  );
}
