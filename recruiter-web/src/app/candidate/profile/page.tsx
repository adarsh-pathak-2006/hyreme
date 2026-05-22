"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/section-card";
import { useAppState } from "@/components/recruiter-provider";
import { uploadAsset } from "@/lib/api";

export default function CandidateProfilePage() {
  const { candidateProfile, saveProfile, user } = useAppState();
  const [form, setForm] = useState({
    name: "",
    role: "",
    location: "",
    headline: "",
    skills: "",
    matchScore: 82,
    experience: "",
    salary: "",
    availability: "",
    introDuration: "00:45",
    introHook: "",
    reelSummary: "",
    preferredMeetingSlots: "",
    reelMoments: "",
    recruiterNote: "",
    resumeUrl: "",
    videoUrl: "",
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    if (candidateProfile) {
      const timeoutId = window.setTimeout(() => {
        setForm({
          name: candidateProfile.name,
          role: candidateProfile.role,
          location: candidateProfile.location,
          headline: candidateProfile.headline,
          skills: candidateProfile.skills.join(", "),
          matchScore: candidateProfile.matchScore,
          experience: candidateProfile.experience,
          salary: candidateProfile.salary,
          availability: candidateProfile.availability,
          introDuration: candidateProfile.introDuration,
          introHook: candidateProfile.introHook,
          reelSummary: candidateProfile.reelSummary,
          preferredMeetingSlots: candidateProfile.preferredMeetingSlots.join(", "),
          reelMoments: candidateProfile.reelMoments.join(", "),
          recruiterNote: candidateProfile.recruiterNote,
          resumeUrl: candidateProfile.resumeUrl ?? "",
          videoUrl: candidateProfile.videoUrl ?? "",
          bio: candidateProfile.bio ?? "",
          linkedin: candidateProfile.socialLinks?.linkedin ?? "",
          github: candidateProfile.socialLinks?.github ?? "",
          portfolio: candidateProfile.socialLinks?.portfolio ?? "",
        });
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    } else if (user?.name && !form.name) {
      const timeoutId = window.setTimeout(() => {
        setForm((current) => ({
          ...current,
          name: user.name,
        }));
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [candidateProfile, user, form.name]);

  return (
    <SectionCard
      eyebrow="Profile setup"
      title="Candidate profile editor"
      description="This profile powers recruiter discovery, saved lists, and interview context."
    >
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSaving(true);
          setSavedMessage(null);

          try {
            await saveProfile({
              name: form.name,
              role: form.role,
              location: form.location,
              headline: form.headline,
              skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
              matchScore: form.matchScore,
              experience: form.experience,
              salary: form.salary,
              availability: form.availability,
              introDuration: form.introDuration,
              introHook: form.introHook,
              reelSummary: form.reelSummary,
              preferredMeetingSlots: form.preferredMeetingSlots
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              reelMoments: form.reelMoments
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              recruiterNote: form.recruiterNote,
              resumeUrl: form.resumeUrl || undefined,
              videoUrl: form.videoUrl || undefined,
              bio: form.bio || undefined,
              socialLinks: {
                linkedin: form.linkedin,
                github: form.github,
                portfolio: form.portfolio,
              },
            });
            setSavedMessage("Profile saved successfully.");
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["name", "Full name"],
            ["role", "Preferred role"],
            ["location", "Location"],
            ["experience", "Experience"],
            ["salary", "Expected salary"],
            ["availability", "Availability"],
            ["introDuration", "Intro duration"],
            ["linkedin", "LinkedIn"],
            ["github", "GitHub"],
            ["portfolio", "Portfolio"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">{label}</span>
              <input
                value={form[key as keyof typeof form] as string | number}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]:
                      key === "matchScore"
                        ? Number(event.target.value)
                        : event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white/84 px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/14 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--accent-deep)]">Resume upload</p>
                <p className="mt-1 text-sm text-[color:rgba(44,42,74,0.62)]">
                  Upload a PDF or Word resume and we&apos;ll store the real file URL in your profile.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                PDF, DOC, DOCX
              </span>
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="mt-4 block w-full text-sm text-[var(--accent-strong)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-deep)] file:px-4 file:py-2 file:font-semibold file:text-white"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                setUploadMessage(null);
                setIsUploadingResume(true);
                try {
                  const uploaded = await uploadAsset(file, "resume");
                  setForm((current) => ({ ...current, resumeUrl: uploaded.url }));
                  setUploadMessage("Resume uploaded and linked to your profile draft.");
                } catch (uploadError) {
                  setUploadMessage(
                    uploadError instanceof Error
                      ? uploadError.message
                      : "Resume upload failed.",
                  );
                } finally {
                  setIsUploadingResume(false);
                  event.target.value = "";
                }
              }}
            />
            <p className="mt-3 break-all text-sm text-[color:rgba(44,42,74,0.68)]">
              {form.resumeUrl || "No resume uploaded yet."}
            </p>
            {isUploadingResume ? (
              <p className="mt-2 text-sm text-[var(--accent-strong)]">Uploading resume...</p>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-[color:rgba(79,81,140,0.12)] bg-[var(--accent-soft)]/14 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--accent-deep)]">Intro reel upload</p>
                <p className="mt-1 text-sm text-[color:rgba(44,42,74,0.62)]">
                  Upload the actual candidate intro video instead of pasting a placeholder URL. We will convert it to a browser-ready MP4 for the recruiter feed.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                Auto-converted to MP4
              </span>
            </div>
            <input
              type="file"
              accept="video/*"
              className="mt-4 block w-full text-sm text-[var(--accent-strong)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-deep)] file:px-4 file:py-2 file:font-semibold file:text-white"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                setUploadMessage(null);
                setIsUploadingVideo(true);
                try {
                  const uploaded = await uploadAsset(file, "video");
                  setForm((current) => ({ ...current, videoUrl: uploaded.url }));
                  setUploadMessage("Video uploaded and linked to your profile draft.");
                } catch (uploadError) {
                  setUploadMessage(
                    uploadError instanceof Error
                      ? uploadError.message
                      : "Video upload failed.",
                  );
                } finally {
                  setIsUploadingVideo(false);
                  event.target.value = "";
                }
              }}
            />
            <p className="mt-3 break-all text-sm text-[color:rgba(44,42,74,0.68)]">
              {form.videoUrl || "No video uploaded yet."}
            </p>
            {isUploadingVideo ? (
              <p className="mt-2 text-sm text-[var(--accent-strong)]">Uploading video...</p>
            ) : null}
          </div>
        </div>

        {[
          ["headline", "Headline"],
          ["introHook", "Intro hook"],
          ["reelSummary", "Reel summary"],
          ["skills", "Skills (comma separated)"],
          ["preferredMeetingSlots", "Preferred meeting slots (comma separated)"],
          ["reelMoments", "Reel moments (comma separated)"],
          ["bio", "Bio"],
          ["recruiterNote", "Recruiter note shown in feed"],
        ].map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">{label}</span>
            <textarea
              rows={key === "bio" || key === "reelSummary" ? 4 : 3}
              value={String(form[key as keyof typeof form] ?? "")}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white/84 px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
            />
          </label>
        ))}

        {uploadMessage ? (
          <div className="rounded-[1.25rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/22 px-4 py-4 text-sm text-[var(--accent-deep)]">
            {uploadMessage}
          </div>
        ) : null}

        {savedMessage ? (
          <div className="rounded-[1.25rem] border border-[var(--accent)]/30 bg-[var(--accent-soft)]/18 px-4 py-4 text-sm text-[var(--accent-deep)]">
            {savedMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSaving || isUploadingResume || isUploadingVideo}
          className="hyreme-primary-button rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save candidate profile"}
        </button>
      </form>
    </SectionCard>
  );
}
