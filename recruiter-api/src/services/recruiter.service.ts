import type {
  AppBootstrapResponse,
  ChatMessage,
  MessageThread,
  NotificationItem,
  SavedCandidatesResponse,
  ScheduledMeeting,
  FeedResponse,
} from "@hyreme/shared";
import { CandidateProfileModel } from "../models/CandidateProfile";
import { ChatMessageModel } from "../models/ChatMessage";
import { InterviewModel } from "../models/Interview";
import { MessageThreadModel } from "../models/MessageThread";
import { NotificationModel } from "../models/Notification";
import { SavedCandidateModel } from "../models/SavedCandidate";
import { UserModel } from "../models/User";
import { AppError } from "../utils/app-error";
import { emitToUser } from "./socket.service";
import { getCandidateFeed } from "./candidate.service";
import { getRecruiterDashboardSummary } from "./dashboard.service";
import {
  toCandidate,
  toChatMessage,
  toInterviewItem,
  toMessageThread,
  toNotification,
  toScheduledMeeting,
} from "./serialization";

export async function getSavedCandidates(recruiterId: string): Promise<SavedCandidatesResponse> {
  const savedDocs = await SavedCandidateModel.find({ recruiterId }).lean();
  const candidateIds = savedDocs.map((entry) => entry.candidateId);
  const [profiles, interviews] = await Promise.all([
    CandidateProfileModel.find({ _id: { $in: candidateIds } }),
    InterviewModel.find({ recruiterId, candidateId: { $in: candidateIds } }),
  ]);

  const meetings: Record<string, ScheduledMeeting | undefined> = {};
  interviews.forEach((interview) => {
    meetings[interview.candidateId.toString()] = toScheduledMeeting(interview);
  });

  return {
    candidates: profiles.map(toCandidate),
    meetings,
  };
}

export async function toggleSavedCandidate(recruiterId: string, candidateId: string) {
  const existing = await SavedCandidateModel.findOne({ recruiterId, candidateId });
  const candidate = await CandidateProfileModel.findById(candidateId);

  if (existing) {
    await existing.deleteOne();
    return { saved: false };
  }

  await SavedCandidateModel.create({
    recruiterId,
    candidateId,
    savedAt: new Date(),
  });

  if (candidate) {
    await NotificationModel.create({
      userId: candidate.userId,
      type: "saved",
      title: "Profile saved",
      message: "A recruiter saved your profile for follow-up.",
    });
  }

  return { saved: true };
}

export async function scheduleInterview(
  recruiterId: string,
  payload: ScheduledMeeting,
  ownerName: string,
) {
  const candidate = await CandidateProfileModel.findById(payload.candidateId);
  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }

  const interview = await InterviewModel.findOneAndUpdate(
    { recruiterId, candidateId: payload.candidateId },
    {
      recruiterId,
      candidateId: payload.candidateId,
      date: payload.date,
      time: payload.time,
      mode: payload.mode,
      note: payload.note,
      owner: ownerName,
      stage: "Recruiter screen",
      meetingLink:
        payload.mode === "Google Meet"
          ? "https://meet.google.com/hyreme-demo"
          : payload.mode === "Zoom"
            ? "https://zoom.us/j/hyreme-demo"
            : "",
      status: "Scheduled",
    },
    { new: true, upsert: true },
  );

  await NotificationModel.create({
    userId: recruiterId,
    type: "interview",
    title: "Interview scheduled",
    message: `Interview scheduled with ${candidate.name} on ${payload.date} at ${payload.time}.`,
  });

  await NotificationModel.create({
    userId: candidate.userId,
    type: "interview",
    title: "Interview invite received",
    message: `${ownerName} scheduled an interview with you on ${payload.date} at ${payload.time}.`,
  });

  return interview;
}

export async function getInterviewItems(recruiterId: string) {
  const interviews = await InterviewModel.find({ recruiterId }).sort({ createdAt: -1 });
  const candidateIds = interviews.map((item) => item.candidateId);
  const candidates = await CandidateProfileModel.find({ _id: { $in: candidateIds } });
  const byId = new Map(candidates.map((candidate) => [candidate._id.toString(), candidate]));

  return interviews.map((interview) => {
    const candidate = byId.get(interview.candidateId.toString());
    return toInterviewItem(
      interview,
      candidate?.name ?? "Candidate",
      candidate?.role ?? "Unknown role",
    );
  });
}

export async function getMessageThreads(recruiterId: string): Promise<MessageThread[]> {
  const threads = await MessageThreadModel.find({ recruiterId }).sort({ updatedAt: -1 });
  const candidateIds = threads.map((thread) => thread.candidateId);
  const candidates = await CandidateProfileModel.find({ _id: { $in: candidateIds } });
  const byId = new Map(candidates.map((candidate) => [candidate._id.toString(), candidate]));

  return threads.map((thread) => {
    const candidate = byId.get(thread.candidateId.toString());
    return toMessageThread(
      thread,
      candidate?.name ?? "Candidate",
      candidate?.role ?? "Unknown role",
    );
  });
}

export async function sendMessage(recruiterId: string, candidateId: string, body: string) {
  const candidate = await CandidateProfileModel.findById(candidateId);
  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }

  const thread = await MessageThreadModel.findOneAndUpdate(
    { recruiterId, candidateId },
    {
      recruiterId,
      candidateId,
      lastMessage: body,
      status: "Awaiting candidate reply",
      updatedAtLabel: "Just now",
    },
    { new: true, upsert: true },
  );

  const message = await ChatMessageModel.create({
    threadId: thread._id,
    senderUserId: recruiterId,
    senderRole: "recruiter",
    body,
  });

  await NotificationModel.create({
    userId: recruiterId,
    type: "message",
    title: "Message sent",
    message: `You messaged ${candidate.name}.`,
  });

  await NotificationModel.create({
    userId: candidate.userId,
    type: "message",
    title: "New recruiter message",
    message: "A recruiter sent you a new message.",
  });

  emitToUser(candidate.userId.toString(), "messages:updated", {
    threadId: thread._id.toString(),
    message: toChatMessage(message),
  });
  emitToUser(recruiterId, "messages:updated", {
    threadId: thread._id.toString(),
    message: toChatMessage(message),
  });

  return thread;
}

export async function getThreadMessagesForRecruiter(recruiterId: string, threadId: string): Promise<ChatMessage[]> {
  const thread = await MessageThreadModel.findOne({ _id: threadId, recruiterId });
  if (!thread) {
    throw new AppError("Thread not found", 404);
  }

  const messages = await ChatMessageModel.find({ threadId }).sort({ createdAt: 1 });
  return messages.map(toChatMessage);
}

export async function getNotifications(recruiterId: string): Promise<NotificationItem[]> {
  const notifications = await NotificationModel.find({ userId: recruiterId })
    .sort({ createdAt: -1 })
    .limit(20);
  return notifications.map(toNotification);
}

export async function getBootstrapData(recruiterId: string): Promise<AppBootstrapResponse> {
  const recruiter = await UserModel.findById(recruiterId);
  if (!recruiter) {
    throw new AppError("Recruiter not found", 404);
  }

  const [dashboard, feed, saved, messages, interviews, notifications] = await Promise.all([
    getRecruiterDashboardSummary(recruiterId),
    getCandidateFeed({ page: 1, limit: 25 }),
    getSavedCandidates(recruiterId),
    getMessageThreads(recruiterId),
    getInterviewItems(recruiterId),
    getNotifications(recruiterId),
  ]);

  return {
    user: {
      id: recruiter._id.toString(),
      name: recruiter.name,
      email: recruiter.email,
      role: recruiter.role,
      profileImage: recruiter.profileImage,
    },
    dashboard,
    feed: feed as FeedResponse,
    saved,
    messages,
    interviews,
    notifications,
  };
}
