"use client";

import Link from "next/link";
import { CandidateCard } from "@/components/candidate-card";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { useRecruiterState } from "@/components/recruiter-provider";

export default function RecruiterDashboardPage() {
  const { candidates, metrics, pipeline, savedCandidates, user } = useRecruiterState();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const dashboardCandidates = savedCandidates.length > 0 ? savedCandidates : candidates;

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-[linear-gradient(145deg,var(--accent-deep),var(--accent-strong))] px-5 py-6 text-stone-50 shadow-[0_24px_100px_rgba(44,42,74,0.28)] sm:px-6 sm:py-7">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent-soft)]">
          Recruiter command center
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}. Faster screening, warmer outreach, cleaner hiring decisions.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:rgba(255,255,255,0.78)]">
              Signed in as {user?.email ?? "your recruiter account"}. Your recruiter OS is pulling live recruiter feed, saved candidates, and interview activity from the API.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/recruiter/feed"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-accent-deep hover:text-accent-strong transition hover:bg-[var(--accent-soft)]/80"
            >
              Open candidate feed
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          eyebrow="Saved candidates"
          title={`Candidates ${firstName} can act on right now`}
          description="Tap a card to open the candidate workspace with chat, meeting scheduling, and shared context."
          action={{ href: "/recruiter/saved", label: "See all saved" }}
        >
          <div className="grid gap-4 grid-cols-1">
            {dashboardCandidates.slice(0, 4).map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                compact
                href={`/recruiter/candidates/${candidate.id}`}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Pipeline health" title="Current recruiter funnel">
          <div className="space-y-4">
            {pipeline.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/16 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--accent-deep)]">
                    {item.label}
                  </p>
                  <p className="text-xl font-semibold text-[var(--accent-deep)]">
                    {item.value}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:rgba(44,42,74,0.62)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
