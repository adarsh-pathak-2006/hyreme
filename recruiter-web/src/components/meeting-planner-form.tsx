"use client";

import { useState } from "react";

type MeetingPlannerFormProps = {
  candidateId: string;
  existingMeeting?: {
    date?: string;
    time?: string;
    mode?: string;
    meetingUrl?: string;
    note?: string;
  };
  scheduleMeeting: (data: {
    candidateId: string;
    date: string;
    time: string;
    mode: string;
    note: string;
    meetingUrl?: string;
  }) => Promise<void>;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
};

export default function MeetingPlannerForm({
  candidateId,
  existingMeeting,
  scheduleMeeting,
  onSuccess,
  onError,
}: MeetingPlannerFormProps) {
  const [date, setDate] = useState(existingMeeting?.date ?? "");
  const [time, setTime] = useState(existingMeeting?.time ?? "");
  const [mode, setMode] = useState(existingMeeting?.mode ?? "Google Meet");
  const [meetingUrl, setMeetingUrl] = useState(existingMeeting?.meetingUrl ?? "");
  const [note, setNote] = useState(existingMeeting?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.1)] bg-[var(--accent-soft)]/6 p-4 space-y-4 text-left"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
          await scheduleMeeting({
            candidateId,
            date,
            time,
            mode,
            note,
            meetingUrl: meetingUrl.trim() || undefined,
          });
          onSuccess("Meeting saved. The candidate dashboard will update automatically.");
        } catch {
          onError("An error occurred while saving the meeting.");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--accent-strong)]">
            Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--accent-strong)]">
            Time
          </span>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--accent-strong)]">
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
        <span className="mb-1.5 block text-xs font-semibold text-[var(--accent-strong)]">
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
        <span className="mb-1.5 block text-xs font-semibold text-[var(--accent-strong)]">
          Recruiter note
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Add discussion focus, interviewer, or context for the invite."
          className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="hyreme-primary-button w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Save meeting"}
      </button>
    </form>
  );
}
