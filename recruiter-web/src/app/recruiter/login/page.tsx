"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppState } from "@/components/recruiter-provider";

export default function RecruiterLoginPage() {
  const router = useRouter();
  const { authStatus, login } = useAppState();
  const [email, setEmail] = useState("ritika@hyreme.io");
  const [password, setPassword] = useState("Hyreme@123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_28%),linear-gradient(180deg,_#fffaf3_0%,_#f8f3eb_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <section className="rounded-[2rem] bg-stone-950 p-6 text-stone-50 shadow-[0_24px_100px_rgba(28,25,23,0.32)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
            Recruiter access
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Recruiter workspace login
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-stone-300">
            The system now supports two-sided authentication. This page keeps a
            direct recruiter entry while the shared auth hub lives at `/login`.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_24px_100px_rgba(120,53,15,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
                Sign in
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                Recruiter login
              </h2>
            </div>
            <Link
              href="/login"
              className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              Open unified login
            </Link>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setIsSubmitting(true);
              try {
                await login("recruiter", email, password);
                router.push("/recruiter");
              } catch (loginError) {
                setError(loginError instanceof Error ? loginError.message : "Login failed");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Work email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white"
              />
            </label>

            {error ? (
              <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Continue to recruiter workspace"}
            </button>
          </form>

          <div className="mt-6 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
            Session status: {authStatus}. Demo recruiter login after seeding:
            `ritika@hyreme.io` / `Hyreme@123`
          </div>
        </section>
      </div>
    </main>
  );
}
