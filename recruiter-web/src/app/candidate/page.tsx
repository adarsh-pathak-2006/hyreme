"use client";

import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { useAppState } from "@/components/recruiter-provider";

export default function CandidateDashboardPage() {
  const { candidateMetrics, candidateProfile, interviews, threads, user } = useAppState();
  const firstName =
    candidateProfile?.name.split(" ")[0] ??
    user?.name.split(" ")[0] ??
    "there";

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-[linear-gradient(145deg,var(--accent-deep),var(--accent-strong))] px-5 py-6 text-stone-50 shadow-[0_24px_100px_rgba(44,42,74,0.28)] sm:px-6 sm:py-7">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent-soft)]">
          Candidate dashboard
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {firstName}. Show your story, not just your resume.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:rgba(255,255,255,0.78)]">
              Signed in as {user?.email ?? "your candidate account"}. Track recruiter interest, keep your profile fresh, and stay ready for messages or interviews.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/candidate/profile"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-accent-deep hover:text-accent-strong transition hover:bg-[var(--accent-soft)]/80"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {candidateMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Profile pulse"
          title={candidateProfile ? `${candidateProfile.name}'s profile pulse` : "Complete your candidate profile"}
          description={
            candidateProfile
              ? candidateProfile.headline
              : "You can start with basics like role, location, skills, availability, resume link, and intro reel details."
          }
          action={{ href: "/candidate/profile", label: "Open profile editor" }}
        >
          {candidateProfile ? (
            <div className="flex flex-col gap-2 text-sm text-[color:rgba(44,42,74,0.7)]">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--accent-soft)]/18 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.4)]">
                  Role
                </span>
                <span className="font-semibold text-[var(--accent-deep)] text-right truncate max-w-[240px]" title={candidateProfile.role}>
                  {candidateProfile.role}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--accent-soft)]/18 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.4)]">
                  Location
                </span>
                <span className="font-semibold text-[var(--accent-deep)] text-right truncate max-w-[240px]" title={candidateProfile.location}>
                  {candidateProfile.location}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--accent-soft)]/18 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.4)]">
                  Availability
                </span>
                <span className="max-w-[240px] truncate font-semibold text-[var(--accent-deep)] text-right" title={candidateProfile.availability}>
                  {candidateProfile.availability}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)]/14 px-5 py-8 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
              No candidate profile yet. Fill in your details to appear in the recruiter feed.
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="Inbox snapshot" title="Current activity">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/16 p-4">
              <p className="text-sm font-semibold text-[var(--accent-deep)]">Recruiter messages</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--accent-deep)]">{threads.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/16 p-4">
              <p className="text-sm font-semibold text-[var(--accent-deep)]">Scheduled interviews</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--accent-deep)]">{interviews.length}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/candidate/messages"
                className="rounded-full bg-[var(--accent-deep)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Open inbox
              </Link>
              <Link
                href="/candidate/interviews"
                className="rounded-full border border-[var(--accent)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-deep)] transition hover:bg-[var(--accent-soft)]/16"
              >
                View interviews
              </Link>
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
