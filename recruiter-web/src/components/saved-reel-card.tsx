"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecruiterState } from "@/components/recruiter-provider";
import { buildPlayableVideoUrl, resolveAssetUrl } from "@/lib/assets";
import type { Candidate } from "@/lib/types";

type SavedReelCardProps = {
  candidate: Candidate;
  autoOpenPlanner?: boolean;
};

export function SavedReelCard({
  candidate,
  autoOpenPlanner = false,
}: SavedReelCardProps) {
  const router = useRouter();
  const { toggleSavedCandidate, scheduleMeeting, meetings } = useRecruiterState();
  const existingMeeting = meetings[candidate.id];
  const [isPlannerOpen, setIsPlannerOpen] = useState(
    autoOpenPlanner || Boolean(existingMeeting),
  );
  const [date, setDate] = useState(existingMeeting?.date ?? "");
  const [time, setTime] = useState(existingMeeting?.time ?? "");
  const [mode, setMode] = useState(existingMeeting?.mode ?? "Google Meet");
  const [meetingUrl, setMeetingUrl] = useState(existingMeeting?.meetingUrl ?? "");
  const [note, setNote] = useState(existingMeeting?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const resumeUrl = resolveAssetUrl(candidate.resumeUrl);
  const reelUrl = buildPlayableVideoUrl(candidate.videoUrl);

  return (
    <article className="rounded-[2rem] border border-[color:rgba(79,81,140,0.12)] bg-white/92 p-4 sm:p-5 shadow-[0_16px_40px_rgba(44,42,74,0.055)]">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.6fr)]">
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,var(--accent-deep),var(--accent-strong))] p-5 text-white sm:p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.22em]">
              SAVED REEL
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold">
              {candidate.introDuration}
            </span>
          </div>
          <h2 className="mt-6 text-3xl font-semibold">{candidate.name}</h2>
          <p className="mt-2 text-sm text-[color:rgba(255,255,255,0.76)]">
            {candidate.role} · {candidate.location}
          </p>
          <p className="mt-6 text-sm leading-7 text-[color:rgba(255,255,255,0.82)]">
            {candidate.reelSummary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {candidate.reelMoments.map((moment) => (
              <span
                key={moment}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium"
              >
                {moment}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/14 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
            <button
              type="button"
              onClick={() => setIsPlannerOpen((current) => !current)}
              className="hyreme-primary-button rounded-full py-2.5 px-3 text-center text-xs sm:text-sm font-semibold transition"
            >
              {existingMeeting ? "Edit meeting" : "Create meeting"}
            </button>
            <button
              type="button"
              onClick={() => {
                router.push(`/recruiter/messages?candidateId=${candidate.id}`);
              }}
              className="hyreme-secondary-button rounded-full py-2.5 px-3 text-center text-xs sm:text-sm font-semibold transition"
            >
              Message
            </button>
            <button
              type="button"
              onClick={() => {
                if (!resumeUrl) {
                  setFeedbackMessage("This candidate has not uploaded a resume yet.");
                  return;
                }

                setFeedbackMessage(null);
                window.open(resumeUrl, "_blank", "noopener,noreferrer");
              }}
              className="hyreme-secondary-button rounded-full py-2.5 px-3 text-center text-xs sm:text-sm font-semibold transition"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => {
                if (!reelUrl) {
                  setFeedbackMessage("This candidate has not uploaded an intro reel yet.");
                  return;
                }

                setFeedbackMessage(null);
                window.open(reelUrl, "_blank", "noopener,noreferrer");
              }}
              className="hyreme-secondary-button rounded-full py-2.5 px-3 text-center text-xs sm:text-sm font-semibold transition"
            >
              View reel
            </button>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.4)]">
              Suggested slots
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.preferredMeetingSlots.map((slot) => (
                <span
                  key={slot}
                  className="rounded-full bg-[var(--accent-soft)]/24 px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>

          {isPlannerOpen ? (
            <form
              className="mt-5 space-y-4 rounded-[1.5rem] bg-white px-4 py-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubmitting(true);
                setFeedbackMessage(null);

                try {
                  await scheduleMeeting({
                    candidateId: candidate.id,
                    date,
                    time,
                    mode,
                    note,
                    meetingUrl: meetingUrl.trim() || undefined,
                  });
                  setFeedbackMessage(
                    "Meeting saved. The candidate dashboard will update automatically.",
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">
                    Date
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">
                    Time
                  </span>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">
                  Meeting mode
                </span>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value)}
                  className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                >
                  <option>Google Meet</option>
                  <option>Zoom</option>
                  <option>Phone screen</option>
                  <option>Office visit</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">
                  Manual meeting link
                </span>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(event) => setMeetingUrl(event.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">
                  Recruiter note
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Add discussion focus, interviewer, or context for the invite."
                  className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="hyreme-primary-button rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save meeting"}
              </button>
            </form>
          ) : null}

          {existingMeeting ? (
            <div className="mt-5 rounded-[1.5rem] border border-[var(--accent)]/30 bg-[var(--accent-soft)]/22 px-4 py-4 text-sm text-[var(--accent-deep)]">
              Meeting planned for {existingMeeting.date || "TBD"} at{" "}
              {existingMeeting.time || "TBD"} via {existingMeeting.mode}.
              {existingMeeting.meetingUrl ? (
                <a
                  href={existingMeeting.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block font-semibold text-[var(--accent-strong)] underline decoration-[var(--accent)]/40 underline-offset-4"
                >
                  Open meeting link
                </a>
              ) : null}
            </div>
          ) : null}

          {feedbackMessage ? (
            <div className="mt-5 rounded-[1.25rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/16 px-4 py-4 text-sm text-[var(--accent-deep)]">
              {feedbackMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => toggleSavedCandidate(candidate.id)}
            className="mt-5 text-sm font-semibold text-[var(--accent-strong)] underline decoration-[var(--accent)]/40 underline-offset-4"
          >
            Remove from saved
          </button>
        </div>
      </div>
    </article>
  );
}
