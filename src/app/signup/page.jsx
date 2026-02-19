"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NEED_OPTIONS = [
  { id: "low_vision", label: "Low Vision Support" },
  { id: "hearing_support", label: "Hearing Support" },
  { id: "dyslexia_support", label: "Dyslexia Support" },
  { id: "speech_support", label: "Speech Support" },
  { id: "motor_support", label: "Motor Support" },
];

function derivePreferenceDefaults(needs) {
  const has = (id) => needs.includes(id);
  return {
    largeText: has("low_vision") || has("dyslexia_support"),
    wideSpacing: has("dyslexia_support"),
    focusLine: has("dyslexia_support"),
    captionsEnabled: has("hearing_support"),
    transcriptVisible: has("hearing_support"),
    voiceAutoSpeak: has("low_vision") || has("speech_support"),
    accessibilityNeeds: needs,
  };
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleNeed = (needId) => {
    setNeeds((prev) =>
      prev.includes(needId) ? prev.filter((n) => n !== needId) : [...prev, needId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("currentUser", email);

      if (data?.token) {
        localStorage.setItem("authToken", data.token);
      }

      try {
        await fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            ...derivePreferenceDefaults(needs),
          }),
        });
      } catch {
        // Non-blocking: account creation should still succeed.
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-100 via-white to-emerald-100 p-6 md:p-10">
      <div className="mx-auto grid min-h-[84vh] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-emerald-100 md:grid-cols-2">
        <section className="bg-emerald-700 p-8 text-white md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Cortex Bridge</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">
            Build your inclusive learning account
          </h1>
          <p className="mt-4 text-emerald-100">
            Create your profile, then land directly on your progress report and Inclusive Studio.
          </p>
          <div className="mt-8 space-y-3 text-sm text-emerald-50">
            <p>Accessibility preferences saved per user</p>
            <p>Interactive lessons for dyslexic learners</p>
            <p>Voice and caption support in one platform</p>
          </div>
        </section>

        <section className="p-8 md:p-10">
          <h2 className="text-3xl font-bold text-emerald-700">Create Account</h2>
          <p className="mt-2 text-slate-500">Start your personalized learning journey now.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <div className="mt-2 flex rounded-xl border border-slate-300 focus-within:border-emerald-500">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className="w-full rounded-l-xl p-3 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-r-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">Accessibility Profile</p>
              <p className="mt-1 text-xs text-slate-500">
                Select support preferences (you can change these later).
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {NEED_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={needs.includes(option.id)}
                      onChange={() => toggleNeed(option.id)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
