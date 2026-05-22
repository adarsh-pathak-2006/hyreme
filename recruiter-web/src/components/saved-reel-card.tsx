"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRecruiterState } from "@/components/recruiter-provider";
import { buildPlayableVideoUrl, resolveAssetUrl } from "@/lib/assets";
import type { Candidate } from "@/lib/types";

// Dynamic Client-side Lazy Loading for the Scheduler Planner Widget
const MeetingPlannerForm = dynamic(() => import("./meeting-planner-form"), {
  loading: () => (
    <div className="flex items-center justify-center p-6 text-xs font-semibold text-[var(--accent-strong)] animate-pulse bg-[var(--accent-soft)]/6 rounded-[1.5rem] border border-dashed border-[var(--accent-soft)]">
      Loading meeting planner...
    </div>
  ),
  ssr: false,
});

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const resumeUrl = resolveAssetUrl(candidate.resumeUrl);
  const reelUrl = buildPlayableVideoUrl(candidate.videoUrl);

  return (
    <article className="rounded-[2.5rem] border border-[color:rgba(79,81,140,0.12)] bg-white/92 p-6 sm:p-8 shadow-[0_16px_48px_rgba(44,42,74,0.05)] transition duration-300 hover:shadow-[0_24px_64px_rgba(44,42,74,0.08)]">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        
        {/* Left Column: Unified Candidate Information */}
        <div className="flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[var(--accent-soft)]/24 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-strong)]">
                Candidate Profile
              </span>
              <span className="rounded-full border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/8 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                Duration: {candidate.introDuration}
              </span>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-[var(--accent-deep)] tracking-tight">{candidate.name}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--accent-strong)]/80">
                {candidate.role} · {candidate.location}
              </p>
            </div>

            <p className="text-sm leading-7 text-stone-600">
              {candidate.reelSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {candidate.reelMoments.map((moment) => (
              <span
                key={moment}
                className="rounded-full bg-[var(--accent-soft)]/20 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]"
              >
                {moment}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Actions, Suggested Slots & Scheduler Planner */}
        <div className="flex flex-col justify-between space-y-6 lg:border-l lg:border-[color:rgba(79,81,140,0.12)] lg:pl-8">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[color:rgba(44,42,74,0.4)]">
              Outreach & Shortlist
            </p>
            
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
              <button
                type="button"
                onClick={() => setIsPlannerOpen((current) => !current)}
                className="hyreme-primary-button rounded-full py-2.5 px-4 text-center text-xs sm:text-sm font-semibold transition"
              >
                {existingMeeting ? "Edit meeting" : "Create meeting"}
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/recruiter/messages?candidateId=${candidate.id}`);
                }}
                className="hyreme-secondary-button rounded-full py-2.5 px-4 text-center text-xs sm:text-sm font-semibold transition"
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
                className="hyreme-secondary-button rounded-full py-2.5 px-4 text-center text-xs sm:text-sm font-semibold transition"
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
                className="hyreme-secondary-button rounded-full py-2.5 px-4 text-center text-xs sm:text-sm font-semibold transition"
              >
                View reel
              </button>
            </div>

            <div className="rounded-[1.5rem] bg-[var(--accent-soft)]/10 border border-[color:rgba(79,81,140,0.06)] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:rgba(44,42,74,0.5)]">
                Suggested slots
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {candidate.preferredMeetingSlots.map((slot) => (
                  <span
                    key={slot}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent-strong)] shadow-sm border border-[color:rgba(79,81,140,0.05)]"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isPlannerOpen ? (
              <MeetingPlannerForm
                candidateId={candidate.id}
                existingMeeting={existingMeeting}
                scheduleMeeting={scheduleMeeting}
                onSuccess={(msg) => setFeedbackMessage(msg)}
                onError={(err) => setFeedbackMessage(err)}
              />
            ) : null}

            {existingMeeting ? (
              <div className="rounded-[1.25rem] border border-[var(--accent)]/20 bg-[var(--accent-soft)]/10 px-4 py-4 text-sm text-[var(--accent-deep)]">
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
              <div className="rounded-[1.25rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/10 px-4 py-4 text-sm text-[var(--accent-deep)]">
                {feedbackMessage}
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => toggleSavedCandidate(candidate.id)}
                className="text-xs font-bold uppercase tracking-wider text-[var(--accent-strong)] hover:text-red-500 transition duration-150 underline decoration-[var(--accent)]/40 underline-offset-4"
              >
                Remove from saved
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </article>
  );
}
