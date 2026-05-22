"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionCard } from "@/components/section-card";
import { useRecruiterState } from "@/components/recruiter-provider";

export default function RecruiterMessagesPage() {
  const searchParams = useSearchParams();
  const {
    candidates,
    loadThreadMessages,
    sendMessageToCandidate,
    threadMessages,
    threads,
    user,
  } = useRecruiterState();
  const candidateIdFromQuery = searchParams.get("candidateId");
  const threadMatchedFromQuery = candidateIdFromQuery
    ? threads.find((thread) => thread.candidateId === candidateIdFromQuery) ?? null
    : null;
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const candidateFromQuery = candidateIdFromQuery
    ? candidates.find((candidate) => candidate.id === candidateIdFromQuery) ?? null
    : null;
  const selectedThread = selectedThreadId
    ? threads.find((thread) => thread.id === selectedThreadId) ?? null
    : threadMatchedFromQuery ?? (candidateIdFromQuery ? null : threads[0] ?? null);
  const activeCandidateId = selectedThread?.candidateId ?? candidateFromQuery?.id ?? null;
  const messages = useMemo(
    () => (selectedThread ? threadMessages[selectedThread.id] ?? [] : []),
    [selectedThread, threadMessages],
  );

  useEffect(() => {
    if (threadMatchedFromQuery && selectedThreadId !== threadMatchedFromQuery.id) {
      const timeoutId = window.setTimeout(() => {
        setSelectedThreadId(threadMatchedFromQuery.id);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (!candidateIdFromQuery && !selectedThreadId && threads[0]?.id) {
      const timeoutId = window.setTimeout(() => {
        setSelectedThreadId(threads[0].id);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [candidateIdFromQuery, selectedThreadId, threadMatchedFromQuery, threads]);

  useEffect(() => {
    if (!selectedThread?.id) {
      return;
    }

    void loadThreadMessages(selectedThread.id);
  }, [loadThreadMessages, selectedThread?.id]);

  return (
    <SectionCard
      eyebrow="Communication"
      title="Messaging center"
      description="A recruiter view that prioritizes active candidates, interview prep, and response speed."
    >
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setSelectedThreadId(thread.id)}
              className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                selectedThread?.id === thread.id
                  ? "border-[var(--accent)]/35 bg-[var(--accent-soft)]/22"
                  : "border-[color:rgba(79,81,140,0.12)] bg-gradient-to-r from-white to-[var(--accent-soft)]/12"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--accent-deep)]">
                    {thread.candidateName}
                  </p>
                  <p className="text-sm text-[color:rgba(44,42,74,0.56)]">{thread.role}</p>
                </div>
                <span className="text-xs text-[color:rgba(44,42,74,0.52)]">
                  {thread.updatedAt}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
                {thread.lastMessage}
              </p>
            </button>
          ))}
        </div>

        <article className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-white/92 p-4 shadow-[0_18px_44px_rgba(44,42,74,0.06)] sm:p-5">
          {selectedThread || candidateFromQuery ? (
            <>
              <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--accent-deep)]">
                    {selectedThread?.candidateName ?? candidateFromQuery?.name}
                  </p>
                  <p className="text-sm text-[color:rgba(44,42,74,0.56)]">
                    {selectedThread?.role ?? candidateFromQuery?.role}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedThread ? (
                    <>
                      <span className="rounded-full bg-[var(--accent-soft)]/24 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                        {selectedThread.status}
                      </span>
                      <span className="text-sm text-[color:rgba(44,42,74,0.52)]">
                        {selectedThread.updatedAt}
                      </span>
                    </>
                  ) : (
                    <span className="rounded-full bg-[var(--accent-soft)]/24 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                      New conversation
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="rounded-2xl bg-[var(--accent-soft)]/14 px-4 py-5 text-sm text-[color:rgba(44,42,74,0.58)]">
                    {selectedThread
                      ? "No messages loaded yet."
                      : "Start the conversation with this candidate from here."}
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
                          className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 ${
                            isOwnMessage
                              ? "bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] text-white"
                              : "bg-[var(--accent-soft)]/24 text-[var(--accent-deep)]"
                          }`}
                        >
                          {message.body}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Send a message to this candidate"
                  className="flex-1 rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const body = draft.trim();
                    if (!body || !activeCandidateId) {
                      return;
                    }

                    const threadId = await sendMessageToCandidate(activeCandidateId, body);
                    setDraft("");

                    if (threadId) {
                      setSelectedThreadId(threadId);
                      await loadThreadMessages(threadId);
                    }
                  }}
                  className="hyreme-primary-button rounded-full px-5 py-3 text-sm font-semibold transition"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-[var(--accent-soft)]/14 px-4 py-5 text-sm text-[color:rgba(44,42,74,0.58)]">
              No active message threads yet.
            </div>
          )}
        </article>
      </div>
    </SectionCard>
  );
}
