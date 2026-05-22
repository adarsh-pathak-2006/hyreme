"use client";

import { useSearchParams } from "next/navigation";
import { useRecruiterState } from "@/components/recruiter-provider";
import { SavedReelCard } from "@/components/saved-reel-card";
import { SectionCard } from "@/components/section-card";

export default function SavedCandidatesPage() {
  const searchParams = useSearchParams();
  const { savedCandidates } = useRecruiterState();
  const selectedCandidateId = searchParams.get("candidateId");
  const shouldOpenMeetingPlanner = searchParams.get("openMeeting") === "1";

  return (
    <SectionCard
      eyebrow="Pipeline"
      title="Saved candidates"
      description="Saved reels stay actionable here, so recruiters can create meetings, message candidates, review resumes, and shortlist without losing context."
    >
      {savedCandidates.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)]/14 px-5 py-10 text-center sm:px-6">
          <p className="text-lg font-semibold text-[var(--accent-deep)]">
            No saved reels yet
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
            Save candidates from the reel feed and they will appear here for
            scheduling and follow-up.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {savedCandidates.map((candidate) => (
            <SavedReelCard
              key={candidate.id}
              candidate={candidate}
              autoOpenPlanner={
                shouldOpenMeetingPlanner && selectedCandidateId === candidate.id
              }
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
