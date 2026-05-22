"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { useAppState } from "@/components/recruiter-provider";

export default function CandidateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAppState();

  return (
    <AuthGuard allowRole="candidate">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(218,191,255,0.4),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(144,122,214,0.14),_transparent_18%),linear-gradient(180deg,_#f7f4ff_0%,_#eef0ff_100%)] px-3 pt-3 pb-28 sm:px-4 sm:pt-4 sm:pb-32 md:px-6 md:pt-6 lg:pb-32">
        <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <aside className="hidden lg:block hyreme-glass rounded-[2rem] p-5">
            <Link href="/" className="block">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                HYREME
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--accent-deep)]">
                Candidate Studio
              </h1>
            </Link>

            <div className="mt-8 rounded-[1.75rem] border border-[var(--accent-soft)]/70 bg-gradient-to-br from-[var(--accent-soft)]/34 via-white to-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Candidate workflow
              </p>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-[var(--accent-deep)]">
                Build a profile that feels human.
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
                Complete your profile, add your reel details, and track recruiter
                activity from one place.
              </p>
            </div>

            <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(160deg,var(--accent-deep),var(--accent-strong))] px-4 py-5 text-stone-50">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-soft)]">
                Tip
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:rgba(255,255,255,0.78)]">
                Profiles with strong hooks, clear skills, and reel context are
                easier for recruiters to shortlist quickly.
              </p>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-white/92 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Account
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--accent-deep)]">
                {user?.name ?? "Candidate"}
              </p>
              <p className="mt-1 text-sm text-[color:rgba(44,42,74,0.68)]">{user?.email}</p>
              <Link
                href="/candidate/account"
                className="hyreme-primary-button mt-4 block w-full rounded-full px-4 py-3 text-center text-sm font-semibold transition"
              >
                Manage account
              </Link>
            </div>
          </aside>

          <section className="space-y-5">{children}</section>
          <aside className="hidden space-y-5 xl:block">
            <div className="hyreme-glass rounded-[1.75rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
                Candidate roadmap
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
                <li>Finish your profile basics and headline.</li>
                <li>Add resume and reel links recruiters can review.</li>
                <li>Respond quickly when interviews or messages arrive.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </AuthGuard>
  );
}
