"use client";

import { SectionCard } from "@/components/section-card";
import { useAppState } from "@/components/recruiter-provider";

export default function CandidateNotificationsPage() {
  const { notifications } = useAppState();

  return (
    <SectionCard
      eyebrow="Notifications"
      title="Candidate alerts"
      description="Updates from recruiter saves, messages, and interviews."
    >
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)]/14 px-5 py-8 text-sm text-[color:rgba(44,42,74,0.7)]">
            No notifications yet.
          </div>
        ) : null}
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-white p-4 shadow-[0_16px_40px_rgba(44,42,74,0.05)] sm:p-5"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
              {notification.type}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--accent-deep)]">
              {notification.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
              {notification.message}
            </p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
