"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthUser = toAuthUser;
exports.toCandidate = toCandidate;
exports.toScheduledMeeting = toScheduledMeeting;
exports.toInterviewItem = toInterviewItem;
exports.toMessageThread = toMessageThread;
exports.toNotification = toNotification;
exports.toChatMessage = toChatMessage;
function toAuthUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage ?? undefined,
    };
}
function toCandidate(profile) {
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
        socialLinks: profile.socialLinks && typeof profile.socialLinks.entries === "function"
            ? Object.fromEntries(profile.socialLinks.entries())
            : {},
    };
}
function toScheduledMeeting(interview) {
    return {
        candidateId: interview.candidateId.toString(),
        date: interview.date,
        time: interview.time,
        mode: interview.mode,
        note: interview.note,
    };
}
function toInterviewItem(interview, candidateName, candidateRole) {
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
        note: interview.note,
        status: interview.status,
    };
}
function toMessageThread(thread, candidateName, role) {
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
function toNotification(notification) {
    return {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt.toISOString(),
        read: notification.read,
    };
}
function toChatMessage(message) {
    return {
        id: message._id.toString(),
        threadId: message.threadId.toString(),
        senderUserId: message.senderUserId.toString(),
        senderRole: message.senderRole,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
    };
}
