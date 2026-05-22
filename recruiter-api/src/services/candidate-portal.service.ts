import type {
  CandidateBootstrapResponse,
  CandidateDashboardSummary,
  ChatMessage,
  MessageThread,
  NotificationItem,
} from "@hyreme/shared";
import { CandidateProfileModel } from "../models/CandidateProfile";
import { ChatMessageModel } from "../models/ChatMessage";
import { InterviewModel } from "../models/Interview";
import { MessageThreadModel } from "../models/MessageThread";
import { NotificationModel } from "../models/Notification";
import { SavedCandidateModel } from "../models/SavedCandidate";
import { UserModel } from "../models/User";
import { AppError } from "../utils/app-error";
import { emitToRole, emitToUser } from "./socket.service";
import {
  toAuthUser,
  toCandidate,
  toChatMessage,
  toInterviewItem,
  toMessageThread,
  toNotification,
} from "./serialization";

export async function getCandidateProfileForUser(userId: string) {
  const profile = await CandidateProfileModel.findOne({ userId });
  return profile ? toCandidate(profile) : null;
}

export async function upsertCandidateProfile(
  userId: string,
  payload: Omit<ReturnType<typeof toCandidate>, "id" | "userId"> & Record<string, unknown>,
) {
  const profile = await CandidateProfileModel.findOneAndUpdate(
    { userId },
    { ...payload, userId },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const candidate = toCandidate(profile);
  emitToRole("recruiter", "feed:updated", {
    candidateId: candidate.id,
    candidateName: candidate.name,
  });

  return candidate;
}

export async function getCandidateDashboardSummary(candidateId: string): Promise<CandidateDashboardSummary> {
  const [savedCount, interviewCount, messageCount] = await Promise.all([
    SavedCandidateModel.countDocuments({ candidateId }),
    InterviewModel.countDocuments({ candidateId }),
    MessageThreadModel.countDocuments({ candidateId }),
  ]);

  return {
    metrics: [
      { label: "Recruiter saves", value: String(savedCount), change: "Profiles recruiters want to revisit" },
      { label: "Interviews", value: String(interviewCount), change: "Confirmed and pending conversations" },
      { label: "Messages", value: String(messageCount), change: "Active recruiter conversations" },
      { label: "Profile strength", value: "82%", change: "Complete your profile to improve discovery" },
    ],
  };
}

export async function getCandidateMessageThreads(candidateId: string): Promise<MessageThread[]> {
  const threads = await MessageThreadModel.find({ candidateId }).sort({ updatedAt: -1 });
  const recruiterIds = threads.map((thread) => thread.recruiterId);
  const recruiters = await UserModel.find({ _id: { $in: recruiterIds } });
  const recruitersById = new Map(recruiters.map((recruiter) => [recruiter._id.toString(), recruiter]));

  return threads.map((thread) => {
    const recruiter = recruitersById.get(thread.recruiterId.toString());
    return {
      ...toMessageThread(thread, recruiter?.name ?? "Recruiter", "Hiring Team"),
      recruiterId: thread.recruiterId.toString(),
      counterpartyName: recruiter?.name ?? "Recruiter",
      counterpartyRole: "Hiring Team",
      candidateName: recruiter?.name ?? "Recruiter",
      role: "Hiring Team",
    };
  });
}

export async function replyToThread(candidateId: string, threadId: string, body: string) {
  const thread = await MessageThreadModel.findOne({ _id: threadId, candidateId });
  if (!thread) {
    throw new AppError("Message thread not found", 404);
  }

  thread.lastMessage = body;
  thread.status = "Awaiting recruiter reply";
  thread.updatedAtLabel = "Just now";
  await thread.save();

  const candidateProfile = await CandidateProfileModel.findById(candidateId);
  if (!candidateProfile) {
    throw new AppError("Candidate profile not found", 404);
  }

  const message = await ChatMessageModel.create({
    threadId: thread._id,
    senderUserId: candidateProfile.userId,
    senderRole: "candidate",
    body,
  });

  await NotificationModel.create({
    userId: thread.recruiterId,
    type: "message",
    title: "Candidate replied",
    message: "A candidate replied to your hiring conversation.",
  });

  emitToUser(thread.recruiterId.toString(), "messages:updated", {
    threadId: thread._id.toString(),
    message: toChatMessage(message),
  });
  emitToUser(candidateProfile.userId.toString(), "messages:updated", {
    threadId: thread._id.toString(),
    message: toChatMessage(message),
  });

  return thread;
}

export async function getThreadMessagesForCandidate(candidateId: string, threadId: string): Promise<ChatMessage[]> {
  const thread = await MessageThreadModel.findOne({ _id: threadId, candidateId });
  if (!thread) {
    throw new AppError("Thread not found", 404);
  }

  const messages = await ChatMessageModel.find({ threadId }).sort({ createdAt: 1 });
  return messages.map(toChatMessage);
}

export async function getCandidateInterviews(candidateId: string) {
  const profile = await CandidateProfileModel.findById(candidateId);
  if (!profile) {
    return [];
  }

  const interviews = await InterviewModel.find({ candidateId }).sort({ createdAt: -1 });
  return interviews.map((interview) =>
    toInterviewItem(interview, profile.name, profile.role),
  );
}

export async function getCandidateNotifications(userId: string): Promise<NotificationItem[]> {
  const notifications = await NotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);
  return notifications.map(toNotification);
}

export async function getCandidateBootstrap(userId: string): Promise<CandidateBootstrapResponse> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("Candidate not found", 404);
  }

  const profileDoc = await CandidateProfileModel.findOne({ userId });
  const profile = profileDoc ? toCandidate(profileDoc) : null;
  const candidateId = profileDoc?._id.toString();

  const [dashboard, messages, interviews, notifications] = await Promise.all([
    candidateId
      ? getCandidateDashboardSummary(candidateId)
      : Promise.resolve({
          metrics: [
            { label: "Recruiter saves", value: "0", change: "Complete your profile to get discovered" },
            { label: "Interviews", value: "0", change: "No meetings scheduled yet" },
            { label: "Messages", value: "0", change: "No recruiter conversations yet" },
            { label: "Profile strength", value: "35%", change: "Add video and resume details" },
          ],
        }),
    candidateId ? getCandidateMessageThreads(candidateId) : Promise.resolve([]),
    candidateId ? getCandidateInterviews(candidateId) : Promise.resolve([]),
    getCandidateNotifications(userId),
  ]);

  return {
    user: toAuthUser(user),
    profile,
    dashboard,
    messages,
    interviews,
    notifications,
  };
}
