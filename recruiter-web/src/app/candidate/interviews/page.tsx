"use client";

import { SectionCard } from "@/components/section-card";
import { useAppState } from "@/components/recruiter-provider";

export default function CandidateInterviewsPage() {
  const { interviews } = useAppState();

  return (
    <SectionCard
      eyebrow="Interviews"
      title="Interview schedule"
      description="Track upcoming recruiter conversations and preparation notes."
    >
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)]/14 px-5 py-8 text-sm text-[color:rgba(44,42,74,0.7)]">
            No interviews scheduled yet.
          </div>
        ) : null}
        {interviews.map((interview) => (
          <article
            key={interview.id}
            className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-gradient-to-r from-white to-[var(--accent-soft)]/12 p-4 shadow-[0_16px_40px_rgba(44,42,74,0.06)] sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--accent-deep)]">{interview.owner}</p>
                <p className="text-sm text-[color:rgba(44,42,74,0.56)]">{interview.stage}</p>
              </div>
              <span className="w-fit rounded-full bg-[var(--accent-soft)]/32 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                {interview.date}
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:rgba(44,42,74,0.4)]">
                  Format
                </p>
                <p className="mt-2 text-sm text-[var(--accent-deep)]">{interview.mode}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:rgba(44,42,74,0.4)]">
                  Link
                </p>
                {interview.meetingUrl ? (
                  <a
                    href={interview.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm font-semibold text-[var(--accent-strong)] underline decoration-[var(--accent)]/40 underline-offset-4"
                  >
                    {interview.linkLabel}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-[var(--accent-deep)]">{interview.linkLabel}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:rgba(44,42,74,0.4)]">
                  Status
                </p>
                <p className="mt-2 text-sm text-[var(--accent-deep)]">{interview.status ?? "Scheduled"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
