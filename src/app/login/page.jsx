"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("currentUser", data?.user?.email || email);

      if (data?.token) {
        localStorage.setItem("authToken", data.token);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-cyan-100 p-6 md:p-10">
      <div className="mx-auto grid min-h-[84vh] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-emerald-100 md:grid-cols-2">
        <section className="bg-slate-900 p-8 text-white md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Cortex Bridge</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">
            Welcome back to your learning space
          </h1>
          <p className="mt-4 text-slate-300">
            Continue where you left off with your personalized progress report and Inclusive
            Studio tools.
          </p>
          <div className="mt-8 space-y-3 text-sm text-slate-200">
            <p>Progress tracking built for consistency</p>
            <p>Voice, dyslexia, and hearing accessibility modes</p>
            <p>One account across all inclusive learning modules</p>
          </div>
        </section>

        <section className="p-8 md:p-10">
          <h2 className="text-3xl font-bold text-emerald-700">Login</h2>
          <p className="mt-2 text-slate-500">Sign in to open your progress report dashboard.</p>

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
                  placeholder="Enter password"
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

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New to Cortex Bridge?{" "}
            <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">
              Create account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
