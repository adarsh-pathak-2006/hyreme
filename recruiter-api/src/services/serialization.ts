import type {
  Candidate,
  ChatMessage,
  InterviewItem,
  MessageThread,
  NotificationItem,
  ScheduledMeeting,
} from "@hyreme/shared";
import type { CandidateProfileDocument } from "../models/CandidateProfile";
import type { ChatMessageDocument } from "../models/ChatMessage";
import type { InterviewDocument } from "../models/Interview";
import type { MessageThreadDocument } from "../models/MessageThread";
import type { NotificationDocument } from "../models/Notification";
import type { UserDocument } from "../models/User";

export function toAuthUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage ?? undefined,
  } as const;
}

export function toCandidate(profile: CandidateProfileDocument): Candidate {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    name: profile.name,
    role: profile.role,
    location: profile.location,
    headline: profile.headline,
    skills: profile.skills,
    matchScore: profile.matchScore,
    experience: profile.experience,
    salary: profile.salary,
    availability: profile.availability,
    introDuration: profile.introDuration,
    introHook: profile.introHook,
    reelSummary: profile.reelSummary,
    preferredMeetingSlots: profile.preferredMeetingSlots,
    reelMoments: profile.reelMoments,
    recruiterNote: profile.recruiterNote,
    resumeUrl: profile.resumeUrl ?? undefined,
    videoUrl: profile.videoUrl ?? undefined,
    bio: profile.bio ?? undefined,
    socialLinks:
      profile.socialLinks && typeof profile.socialLinks.entries === "function"
        ? Object.fromEntries(profile.socialLinks.entries())
        : {},
  };
}

export function toScheduledMeeting(interview: InterviewDocument): ScheduledMeeting {
  return {
    candidateId: interview.candidateId.toString(),
    date: interview.date,
    time: interview.time,
    mode: interview.mode,
    note: interview.note,
    meetingUrl: interview.meetingLink || undefined,
  };
}

export function toInterviewItem(
  interview: InterviewDocument,
  candidateName: string,
  candidateRole: string,
): InterviewItem {
  return {
    id: interview._id.toString(),
    candidateId: interview.candidateId.toString(),
    candidateName,
    role: candidateRole,
    stage: interview.stage,
    date: `${interview.date} - ${interview.time}`,
    owner: interview.owner,
    mode: interview.mode,
    linkLabel: interview.meetingLink ? "Meet link ready" : "Invite pending confirmation",
    meetingUrl: interview.meetingLink || undefined,
    note: interview.note,
    status: interview.status,
  };
}

export function toMessageThread(
  thread: MessageThreadDocument,
  candidateName: string,
  role: string,
): MessageThread {
  return {
    id: thread._id.toString(),
    candidateId: thread.candidateId.toString(),
    candidateName,
    role,
    status: thread.status,
    updatedAt: thread.updatedAtLabel,
    lastMessage: thread.lastMessage,
  };
}

export function toNotification(notification: NotificationDocument): NotificationItem {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt.toISOString(),
    read: notification.read,
  };
}

export function toChatMessage(message: ChatMessageDocument): ChatMessage {
  return {
    id: message._id.toString(),
    threadId: message.threadId.toString(),
    senderUserId: message.senderUserId.toString(),
    senderRole: message.senderRole,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}
