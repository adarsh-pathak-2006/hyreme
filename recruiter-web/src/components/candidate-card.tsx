import Link from "next/link";
import type { Candidate } from "@/lib/types";

type CandidateCardProps = {
  candidate: Candidate;
  compact?: boolean;
  href?: string;
};

export function CandidateCard({
  candidate,
  compact = false,
  href,
}: CandidateCardProps) {
  const content = (
    <article className="rounded-[1.75rem] border border-[color:rgba(79,81,140,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(252,251,255,0.9))] p-4 shadow-[0_18px_44px_rgba(44,42,74,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(44,42,74,0.12)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] via-[var(--accent)]/35 to-[var(--accent-strong)]/25 text-lg font-semibold text-[var(--accent-deep)]">
            {candidate.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--accent-deep)]">
              {candidate.name}
            </p>
            <p className="text-sm text-[color:rgba(44,42,74,0.56)]">
              {candidate.role} · {candidate.location}
            </p>
          </div>
        </div>
        <span className="w-fit rounded-full bg-[var(--accent-soft)]/45 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
          {candidate.matchScore}% match
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-[color:rgba(44,42,74,0.72)]">
        {candidate.headline}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {candidate.skills.slice(0, compact ? 3 : 5).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[var(--accent-soft)]/24 px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 text-sm text-[color:rgba(44,42,74,0.7)] sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-[var(--accent-soft)]/18 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.4)]">
            Experience
          </p>
          <p className="mt-2 font-semibold text-[var(--accent-deep)]">
            {candidate.experience}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)]/18 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.4)]">
            Salary
          </p>
          <p className="mt-2 font-semibold text-[var(--accent-deep)]">
            {candidate.salary}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)]/18 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.4)]">
            Availability
          </p>
          <p className="mt-2 font-semibold text-[var(--accent-deep)]">
            {candidate.availability}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            className="hyreme-primary-button rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Save candidate
          </button>
          <button
            type="button"
            className="hyreme-secondary-button rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Message
          </button>
          <button
            type="button"
            className="hyreme-secondary-button rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Schedule interview
          </button>
        </div>
      )}
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
