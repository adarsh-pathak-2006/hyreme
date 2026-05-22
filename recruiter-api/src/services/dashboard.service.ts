import type { DashboardSummary, PipelineItem, RecruiterMetric } from "@hyreme/shared";
import { CandidateProfileModel } from "../models/CandidateProfile";
import { InterviewModel } from "../models/Interview";
import { MessageThreadModel } from "../models/MessageThread";
import { SavedCandidateModel } from "../models/SavedCandidate";

export async function getRecruiterDashboardSummary(recruiterId: string): Promise<DashboardSummary> {
  const [candidateCount, savedCount, interviewCount, threadCount] = await Promise.all([
    CandidateProfileModel.countDocuments({}),
    SavedCandidateModel.countDocuments({ recruiterId }),
    InterviewModel.countDocuments({ recruiterId }),
    MessageThreadModel.countDocuments({ recruiterId }),
  ]);

  const metrics: RecruiterMetric[] = [
    {
      label: "Active candidate pool",
      value: String(candidateCount),
      change: candidateCount > 0 ? "Live profiles available in MongoDB" : "No live candidates yet",
    },
    {
      label: "Interviews booked",
      value: String(interviewCount),
      change: interviewCount > 0 ? "Upcoming recruiter conversations" : "No interviews scheduled yet",
    },
    {
      label: "Active conversations",
      value: String(threadCount),
      change: threadCount > 0 ? "Threads currently in motion" : "No live recruiter threads yet",
    },
    {
      label: "Save-to-interview",
      value: `${savedCount > 0 ? Math.max(1, Math.round((interviewCount / savedCount) * 100)) : 0}%`,
      change: savedCount > 0 ? "Conversion based on live recruiter data" : "Waiting for saved candidates",
    },
  ];

  const pipeline: PipelineItem[] = [
    {
      label: "Saved for review",
      value: String(savedCount),
      description: "Candidates your team marked for deeper evaluation.",
    },
    {
      label: "Awaiting recruiter reply",
      value: String(threadCount),
      description: "Messaging threads where speed matters to avoid drop-off.",
    },
    {
      label: "Interview prep needed",
      value: String(interviewCount),
      description: "Candidates with confirmed meetings in the next 72 hours.",
    },
  ];

  return { metrics, pipeline };
}
