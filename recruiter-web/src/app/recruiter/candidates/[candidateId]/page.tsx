"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/section-card";
import { useRecruiterState } from "@/components/recruiter-provider";
import { buildPlayableVideoUrl, resolveAssetUrl } from "@/lib/assets";

type RecruiterCandidateWorkspacePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default function RecruiterCandidateWorkspacePage({
  params,
}: RecruiterCandidateWorkspacePageProps) {
  const { candidateId } = use(params);
  const {
    candidates,
    loadThreadMessages,
    meetings,
    savedCandidates,
    scheduleMeeting,
    sendMessageToCandidate,
    threadMessages,
    threads,
    user,
  } = useRecruiterState();
  const candidate =
    savedCandidates.find((item) => item.id === candidateId) ??
    candidates.find((item) => item.id === candidateId) ??
    null;
  const thread = threads.find((item) => item.candidateId === candidateId) ?? null;
  const messages = useMemo(
    () => (thread ? threadMessages[thread.id] ?? [] : []),
    [thread, threadMessages],
  );
  const existingMeeting = meetings[candidateId];
  const [draft, setDraft] = useState("");
  const [meetingDate, setMeetingDate] = useState(existingMeeting?.date ?? "");
  const [meetingTime, setMeetingTime] = useState(existingMeeting?.time ?? "");
  const [meetingMode, setMeetingMode] = useState(existingMeeting?.mode ?? "Google Meet");
  const [meetingUrl, setMeetingUrl] = useState(existingMeeting?.meetingUrl ?? "");
  const [meetingNote, setMeetingNote] = useState(existingMeeting?.note ?? "");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<string | null>(null);
  const resumeUrl = resolveAssetUrl(candidate?.resumeUrl);
  const reelUrl = buildPlayableVideoUrl(candidate?.videoUrl);

  useEffect(() => {
    if (!thread?.id) {
      return;
    }

    void loadThreadMessages(thread.id);
  }, [loadThreadMessages, thread?.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMeetingDate(existingMeeting?.date ?? "");
      setMeetingTime(existingMeeting?.time ?? "");
      setMeetingMode(existingMeeting?.mode ?? "Google Meet");
      setMeetingUrl(existingMeeting?.meetingUrl ?? "");
      setMeetingNote(existingMeeting?.note ?? "");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [existingMeeting]);

  if (!candidate) {
    return (
      <SectionCard
        eyebrow="Candidate workspace"
        title="Candidate not found"
        description="This candidate could not be loaded into the recruiter workspace."
      >
        <Link
          href="/recruiter"
          className="hyreme-primary-button inline-flex rounded-full px-5 py-3 text-sm font-semibold transition"
        >
          Back to recruiter OS
        </Link>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <section className="rounded-[2rem] bg-[linear-gradient(145deg,var(--accent-deep),var(--accent-strong))] px-5 py-6 text-stone-50 shadow-[0_24px_100px_rgba(44,42,74,0.28)] sm:px-6 sm:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent-soft)]">
              Candidate workspace
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {candidate.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:rgba(255,255,255,0.78)]">
              {candidate.role} · {candidate.location}. Keep scheduling and outreach in one place for cleaner follow-up.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {resumeUrl ? (
              <Link
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--accent-deep)] transition hover:bg-[var(--accent-soft)]/80"
              >
                Open resume
              </Link>
            ) : null}
            {reelUrl ? (
              <Link
                href={reelUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/18"
              >
                Open reel
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Scheduling"
          title="Meeting planner"
          description="Create or update the live meeting details that the candidate will see in their dashboard."
        >
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsScheduling(true);
              setScheduleFeedback(null);

              try {
                await scheduleMeeting({
                  candidateId,
                  date: meetingDate,
                  time: meetingTime,
                  mode: meetingMode,
                  note: meetingNote,
                  meetingUrl: meetingUrl.trim() || undefined,
                });
                setScheduleFeedback("Meeting details saved and synced to the candidate dashboard.");
              } finally {
                setIsScheduling(false);
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
                  value={meetingDate}
                  onChange={(event) => setMeetingDate(event.target.value)}
                  className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">
                  Time
                </span>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(event) => setMeetingTime(event.target.value)}
                  className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">
                Meeting mode
              </span>
              <select
                value={meetingMode}
                onChange={(event) => setMeetingMode(event.target.value)}
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
                value={meetingNote}
                onChange={(event) => setMeetingNote(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
              />
            </label>

            <button
              type="submit"
              disabled={isScheduling}
              className="hyreme-primary-button rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
            >
              {isScheduling ? "Saving..." : "Save meeting details"}
            </button>

            {scheduleFeedback ? (
              <div className="rounded-[1.25rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/16 px-4 py-4 text-sm text-[var(--accent-deep)]">
                {scheduleFeedback}
              </div>
            ) : null}
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Conversation"
          title="Recruiter chat"
          description="Messages sync to the database and appear in the candidate inbox in real time."
        >
          <div className="space-y-4">
            <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/10 p-4">
              {messages.length === 0 ? (
                <div className="rounded-2xl bg-white/90 px-4 py-5 text-sm text-[color:rgba(44,42,74,0.58)]">
                  Start the first conversation with {candidate.name.split(" ")[0]} from here.
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderUserId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 ${
                          isOwnMessage
                            ? "bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] text-white"
                            : "bg-white text-[var(--accent-deep)]"
                        }`}
                      >
                        {message.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message ${candidate.name.split(" ")[0]}`}
                className="flex-1 rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
              />
              <button
                type="button"
                disabled={isSendingMessage}
                onClick={async () => {
                  const body = draft.trim();
                  if (!body) {
                    return;
                  }

                  setIsSendingMessage(true);
                  setMessageFeedback(null);
                  try {
                    const threadId = await sendMessageToCandidate(candidateId, body);
                    setDraft("");
                    setMessageFeedback("Message sent and synced to the candidate inbox.");
                    if (threadId) {
                      await loadThreadMessages(threadId);
                    }
                  } finally {
                    setIsSendingMessage(false);
                  }
                }}
                className="hyreme-primary-button rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
              >
                {isSendingMessage ? "Sending..." : "Send"}
              </button>
            </div>

            {messageFeedback ? (
              <div className="rounded-[1.25rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/16 px-4 py-4 text-sm text-[var(--accent-deep)]">
                {messageFeedback}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
