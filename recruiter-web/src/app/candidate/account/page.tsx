"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { useAppState } from "@/components/recruiter-provider";

export default function CandidateAccountPage() {
  const {
    authStatus,
    candidateMetrics,
    candidateProfile,
    logout,
    notifications,
    user,
  } = useAppState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profile = {
    name: candidateProfile?.name ?? user?.name ?? "Candidate",
    email: user?.email ?? "candidate@hyreme.io",
    role: candidateProfile?.role ?? "Candidate",
    location: candidateProfile?.location ?? "Profile incomplete",
  };

  return (
    <SectionCard
      eyebrow="Account"
      title="Candidate profile"
      description={
        authStatus === "authenticated"
          ? "Your candidate account is connected to the live API session."
          : "Sign in to manage your candidate account and recruiter activity."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-deep)] via-[var(--accent-strong)] to-[var(--accent)] p-6 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/10 text-xl font-semibold">
            {profile.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          <h2 className="mt-5 text-2xl font-semibold">{profile.name}</h2>
          <p className="mt-2 text-sm text-[color:rgba(255,255,255,0.82)]">{profile.role}</p>
          <p className="mt-1 text-sm text-[color:rgba(255,255,255,0.82)]">{profile.email}</p>
          <p className="mt-1 text-sm text-[color:rgba(255,255,255,0.72)]">{profile.location}</p>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-soft)]">
              Inbox and alerts
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/candidate/messages"
                className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/18"
              >
                Open messages
              </Link>
              <Link
                href="/candidate/notifications"
                className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/18"
              >
                View alerts ({notifications.length})
              </Link>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={async () => {
              setIsLoggingOut(true);
              try {
                await logout();
              } finally {
                setIsLoggingOut(false);
              }
            }}
            className="mt-6 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/18 disabled:opacity-70"
          >
            {isLoggingOut ? "Signing out..." : "Secure logout"}
          </button>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidateMetrics.slice(0, 3).map((item) => (
            <article
              key={item.label}
              className="rounded-[1.75rem] border border-[color:rgba(79,81,140,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(252,251,255,0.9))] p-5 shadow-[0_18px_44px_rgba(44,42,74,0.08)]"
            >
              <p className="text-sm text-[color:rgba(44,42,74,0.58)]">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--accent-deep)]">
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
