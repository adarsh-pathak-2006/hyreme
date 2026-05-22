"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRecruiterState } from "@/components/recruiter-provider";
import { getApiOrigin } from "@/lib/api";
import { buildPlayableVideoUrl, resolveAssetUrl } from "@/lib/assets";
import type { Candidate } from "@/lib/types";

function buildVideoPosterUrl(url?: string) {
  return null;
}

function ActionButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void onClick?.();
      }}
      className={`flex h-11 w-11 items-center justify-center rounded-full border text-[10px] font-bold tracking-[0.1em] transition ${
        active
          ? "border-accent-soft bg-gradient-to-br from-accent-strong to-accent text-white shadow-[0_8px_30px_rgba(79,81,140,0.35)]"
          : "border-white/14 bg-black/45 text-white hover:bg-accent-strong/48"
      }`}
    >
      {label}
    </button>
  );
}

function CandidateMeta({ candidate, index }: { candidate: Candidate; index: number }) {
  return (
    <div className="space-y-2 text-white">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold backdrop-blur">
          {candidate.name
            .split(" ")
            .map((part: string) => part[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <p className="text-sm font-semibold">{candidate.name}</p>
          <p className="text-xs text-stone-300">
            {candidate.role} · {candidate.location}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-white/12 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white">
          Reel {index + 1}
        </span>
        <span className="rounded-full bg-[var(--accent-soft)]/24 px-2 py-0.5 text-[9px] font-semibold text-[var(--accent-soft)]">
          {candidate.matchScore}% match
        </span>
      </div>

      <div>
        <p className="text-xs font-semibold leading-tight text-white line-clamp-1">{candidate.introHook}</p>
        <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-stone-200 line-clamp-2">
          {candidate.reelSummary}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {candidate.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white"
          >
            #{skill.replace(/\s+/g, "")}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReelSlide({
  candidate,
  index,
  isMuted,
  setIsMuted,
}: {
  candidate: Candidate;
  index: number;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}) {
  const router = useRouter();
  const { toggleSavedCandidate, isCandidateSaved } = useRecruiterState();
  const isSaved = isCandidateSaved(candidate.id);
  const videoUrl = buildPlayableVideoUrl(candidate.videoUrl);
  const posterUrl = buildVideoPosterUrl(candidate.videoUrl);
  const resumeUrl = resolveAssetUrl(candidate.resumeUrl);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVideoError(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [videoUrl]);

  return (
    <article className="flex h-[100dvh] w-screen snap-start snap-always items-center justify-center py-0 lg:h-[calc(100vh-8rem)] lg:w-auto lg:py-2">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#100f1c] lg:max-h-[640px] lg:aspect-[9/16] lg:rounded-[2rem] lg:border lg:border-white/10 lg:bg-[linear-gradient(180deg,_#1b1830_0%,_#2c2a4a_55%,_#181629_100%)] lg:shadow-[0_24px_120px_rgba(0,0,0,0.48)]">
        {/* Header - transparent overlay at top */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent px-5 pb-4 pt-[calc(16px+env(safe-area-inset-top,0px))] lg:pt-4 text-white">
          <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold tracking-[0.18em]">
            HYREME REEL
          </span>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold">
              {candidate.introDuration}
            </span>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white hover:bg-[var(--accent-strong)] hover:border-[var(--accent-soft)] transition"
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm7 5.5l-2.5-2.5H5v-2h2.5L10 7.5v7zm4-2.5c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Video / Content Area */}
        <div className="relative h-full w-full bg-[#100f1c]">
          {videoUrl && !videoError ? (
            <video
              key={videoUrl}
              className="h-full w-full object-cover"
              src={videoUrl}
              crossOrigin="anonymous"
              poster={posterUrl ?? undefined}
              controls={false}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,_#201c38_0%,_#17142b_100%)] px-6 text-center text-white">
              <div className="max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-soft)]">
                  {videoUrl ? "Video Error" : "Video unavailable"}
                </p>
                <p className="mt-2 text-xs leading-5 text-stone-300">
                  {videoUrl
                    ? "Normalization failed. Click CV/workspace to verify."
                    : "No intro reel uploaded yet. Details are overlayed below."}
                </p>
              </div>
            </div>
          )}

          {/* Dark gradient overlay at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Footer info & action buttons - overlayed at the bottom */}
        <div className="absolute bottom-0 inset-x-0 z-20 px-5 pt-5 pb-[calc(76px+env(safe-area-inset-bottom,0px))] lg:pb-5 bg-gradient-to-t from-black to-transparent text-white">
          <CandidateMeta candidate={candidate} index={index} />
          
          <div className="mt-4 flex items-center gap-2">
            <ActionButton
              label={isSaved ? "SVD" : "SAVE"}
              active={isSaved}
              onClick={() => toggleSavedCandidate(candidate.id)}
            />
            <ActionButton
              label="MSG"
              onClick={() => {
                router.push(`/recruiter/messages?candidateId=${candidate.id}`);
              }}
            />
            {resumeUrl ? (
              <Link
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-black/45 text-[10px] font-bold tracking-[0.1em] text-white transition hover:bg-accent-strong/48"
              >
                CV
              </Link>
            ) : (
              <ActionButton label="CV" />
            )}
            <ActionButton
              label="MEET"
              onClick={async () => {
                if (!isSaved) {
                  await toggleSavedCandidate(candidate.id);
                }
                router.push(`/recruiter/saved?candidateId=${candidate.id}&openMeeting=1`);
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ReelFeed() {
  const { candidates } = useRecruiterState();
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="hide-scrollbar h-[100dvh] w-screen lg:h-[calc(100vh-2rem)] lg:w-auto snap-y snap-mandatory overflow-y-auto bg-transparent pb-0 lg:pb-0">
      {candidates.map((candidate, index) => (
        <ReelSlide
          key={candidate.id}
          candidate={candidate}
          index={index}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      ))}
    </div>
  );
}
