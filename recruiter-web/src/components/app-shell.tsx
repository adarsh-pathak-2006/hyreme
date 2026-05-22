"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  rightRail?: ReactNode;
};

const pageCopy: Record<string, { eyebrow: string; title: string; note: string }> = {
  "/recruiter": {
    eyebrow: "Recruiter workspace",
    title: "Overview",
    note: "A cleaner control surface for screening, outreach, and meeting coordination.",
  },
  "/recruiter/feed": {
    eyebrow: "Recruiter workspace",
    title: "Candidate feed",
    note: "Reels-style candidate review stays immersive so recruiters can move quickly.",
  },
  "/recruiter/saved": {
    eyebrow: "Recruiter workspace",
    title: "Saved candidates",
    note: "Shortlisted reels, meeting plans, and follow-up context in one place.",
  },
  "/recruiter/messages": {
    eyebrow: "Recruiter workspace",
    title: "Messages",
    note: "Priority threads with recent replies and candidate context.",
  },
  "/recruiter/interviews": {
    eyebrow: "Recruiter workspace",
    title: "Meetings",
    note: "Upcoming interviews and scheduling visibility for the team.",
  },
  "/recruiter/account": {
    eyebrow: "Recruiter workspace",
    title: "Account",
    note: "Your recruiter profile, role context, and workflow snapshot.",
  },
};

export function AppShell({ children, rightRail }: AppShellProps) {
  const pathname = usePathname();
  const isFeedRoute = pathname.startsWith("/recruiter/feed");
  const currentPage =
    pageCopy[pathname] ??
    Object.entries(pageCopy).find(([route]) => pathname.startsWith(`${route}/`))?.[1] ??
    pageCopy["/recruiter"];

  if (isFeedRoute) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(218,191,255,0.2),_transparent_22%),linear-gradient(180deg,_#181629_0%,_#2c2a4a_52%,_#1a1830_100%)]">
        {children}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(218,191,255,0.44),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(144,122,214,0.16),_transparent_18%),linear-gradient(180deg,_#f8f5ff_0%,_#f1ecff_100%)] px-3 pt-3 pb-28 sm:px-4 sm:pt-4 sm:pb-32 md:px-6 md:pt-6 lg:pb-6">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block hyreme-glass rounded-[2rem] p-5">
          <Link href="/" className="block">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              HYREME
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--accent-deep)]">
              Recruiter OS
            </h1>
          </Link>

          <div className="mt-8 rounded-[1.75rem] border border-[var(--accent-soft)]/70 bg-gradient-to-br from-[var(--accent-soft)]/34 via-white to-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              {currentPage.eyebrow}
            </p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-[var(--accent-deep)]">
              {currentPage.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
              {currentPage.note}
            </p>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(160deg,var(--accent-deep),var(--accent-strong))] px-4 py-5 text-stone-50 shadow-[0_18px_50px_rgba(44,42,74,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-soft)]">
              Team pulse
            </p>
            <p className="mt-3 text-2xl font-semibold">12 candidates</p>
            <p className="mt-2 text-sm leading-6 text-[color:rgba(255,255,255,0.78)]">
              need a same-day recruiter response to keep the best talent warm.
            </p>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/16 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Navigation
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
              The bottom dock is now the primary app navigation to reduce repeated menu choices across pages.
            </p>
          </div>
        </aside>

        <section className="space-y-5">{children}</section>
        {rightRail ? <aside className="hidden space-y-5 xl:block">{rightRail}</aside> : null}
      </div>
    </main>
  );
}
