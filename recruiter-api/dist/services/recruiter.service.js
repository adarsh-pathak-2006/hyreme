"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedCandidates = getSavedCandidates;
exports.toggleSavedCandidate = toggleSavedCandidate;
exports.scheduleInterview = scheduleInterview;
exports.getInterviewItems = getInterviewItems;
exports.getMessageThreads = getMessageThreads;
exports.sendMessage = sendMessage;
exports.getThreadMessagesForRecruiter = getThreadMessagesForRecruiter;
exports.getNotifications = getNotifications;
exports.getBootstrapData = getBootstrapData;
const CandidateProfile_1 = require("../models/CandidateProfile");
const ChatMessage_1 = require("../models/ChatMessage");
const Interview_1 = require("../models/Interview");
const MessageThread_1 = require("../models/MessageThread");
const Notification_1 = require("../models/Notification");
const SavedCandidate_1 = require("../models/SavedCandidate");
const User_1 = require("../models/User");
const app_error_1 = require("../utils/app-error");
const socket_service_1 = require("./socket.service");
const candidate_service_1 = require("./candidate.service");
const dashboard_service_1 = require("./dashboard.service");
const serialization_1 = require("./serialization");
async function getSavedCandidates(recruiterId) {
    const savedDocs = await SavedCandidate_1.SavedCandidateModel.find({ recruiterId }).lean();
    const candidateIds = savedDocs.map((entry) => entry.candidateId);
    const [profiles, interviews] = await Promise.all([
        CandidateProfile_1.CandidateProfileModel.find({ _id: { $in: candidateIds } }),
        Interview_1.InterviewModel.find({ recruiterId, candidateId: { $in: candidateIds } }),
    ]);
    const meetings = {};
    interviews.forEach((interview) => {
        meetings[interview.candidateId.toString()] = (0, serialization_1.toScheduledMeeting)(interview);
    });
    return {
        candidates: profiles.map(serialization_1.toCandidate),
        meetings,
    };
}
async function toggleSavedCandidate(recruiterId, candidateId) {
    const existing = await SavedCandidate_1.SavedCandidateModel.findOne({ recruiterId, candidateId });
    const candidate = await CandidateProfile_1.CandidateProfileModel.findById(candidateId);
    if (existing) {
        await existing.deleteOne();
        return { saved: false };
    }
    await SavedCandidate_1.SavedCandidateModel.create({
        recruiterId,
        candidateId,
        savedAt: new Date(),
    });
    if (candidate) {
        await Notification_1.NotificationModel.create({
            userId: candidate.userId,
            type: "saved",
            title: "Profile saved",
            message: "A recruiter saved your profile for follow-up.",
        });
    }
    return { saved: true };
}
async function scheduleInterview(recruiterId, payload, ownerName) {
    const candidate = await CandidateProfile_1.CandidateProfileModel.findById(payload.candidateId);
    if (!candidate) {
        throw new app_error_1.AppError("Candidate not found", 404);
    }
    const interview = await Interview_1.InterviewModel.findOneAndUpdate({ recruiterId, candidateId: payload.candidateId }, {
        recruiterId,
        candidateId: payload.candidateId,
        date: payload.date,
        time: payload.time,
        mode: payload.mode,
        note: payload.note,
        owner: ownerName,
        stage: "Recruiter screen",
        meetingLink: payload.mode === "Google Meet"
            ? "https://meet.google.com/hyreme-demo"
            : payload.mode === "Zoom"
                ? "https://zoom.us/j/hyreme-demo"
                : "",
        status: "Scheduled",
    }, { new: true, upsert: true });
    await Notification_1.NotificationModel.create({
        userId: recruiterId,
        type: "interview",
        title: "Interview scheduled",
        message: `Interview scheduled with ${candidate.name} on ${payload.date} at ${payload.time}.`,
    });
    await Notification_1.NotificationModel.create({
        userId: candidate.userId,
        type: "interview",
        title: "Interview invite received",
        message: `${ownerName} scheduled an interview with you on ${payload.date} at ${payload.time}.`,
    });
    return interview;
}
async function getInterviewItems(recruiterId) {
    const interviews = await Interview_1.InterviewModel.find({ recruiterId }).sort({ createdAt: -1 });
    const candidateIds = interviews.map((item) => item.candidateId);
    const candidates = await CandidateProfile_1.CandidateProfileModel.find({ _id: { $in: candidateIds } });
    const byId = new Map(candidates.map((candidate) => [candidate._id.toString(), candidate]));
    return interviews.map((interview) => {
        const candidate = byId.get(interview.candidateId.toString());
        return (0, serialization_1.toInterviewItem)(interview, candidate?.name ?? "Candidate", candidate?.role ?? "Unknown role");
    });
}
async function getMessageThreads(recruiterId) {
    const threads = await MessageThread_1.MessageThreadModel.find({ recruiterId }).sort({ updatedAt: -1 });
    const candidateIds = threads.map((thread) => thread.candidateId);
    const candidates = await CandidateProfile_1.CandidateProfileModel.find({ _id: { $in: candidateIds } });
    const byId = new Map(candidates.map((candidate) => [candidate._id.toString(), candidate]));
    return threads.map((thread) => {
        const candidate = byId.get(thread.candidateId.toString());
        return (0, serialization_1.toMessageThread)(thread, candidate?.name ?? "Candidate", candidate?.role ?? "Unknown role");
    });
}
async function sendMessage(recruiterId, candidateId, body) {
    const candidate = await CandidateProfile_1.CandidateProfileModel.findById(candidateId);
    if (!candidate) {
        throw new app_error_1.AppError("Candidate not found", 404);
    }
    const thread = await MessageThread_1.MessageThreadModel.findOneAndUpdate({ recruiterId, candidateId }, {
        recruiterId,
        candidateId,
        lastMessage: body,
        status: "Awaiting candidate reply",
        updatedAtLabel: "Just now",
    }, { new: true, upsert: true });
    const message = await ChatMessage_1.ChatMessageModel.create({
        threadId: thread._id,
        senderUserId: recruiterId,
        senderRole: "recruiter",
        body,
    });
    await Notification_1.NotificationModel.create({
        userId: recruiterId,
        type: "message",
        title: "Message sent",
        message: `You messaged ${candidate.name}.`,
    });
    await Notification_1.NotificationModel.create({
        userId: candidate.userId,
        type: "message",
        title: "New recruiter message",
        message: "A recruiter sent you a new message.",
    });
    (0, socket_service_1.emitToUser)(candidate.userId.toString(), "messages:updated", {
        threadId: thread._id.toString(),
        message: (0, serialization_1.toChatMessage)(message),
    });
    (0, socket_service_1.emitToUser)(recruiterId, "messages:updated", {
        threadId: thread._id.toString(),
        message: (0, serialization_1.toChatMessage)(message),
    });
    return thread;
}
async function getThreadMessagesForRecruiter(recruiterId, threadId) {
    const thread = await MessageThread_1.MessageThreadModel.findOne({ _id: threadId, recruiterId });
    if (!thread) {
        throw new app_error_1.AppError("Thread not found", 404);
    }
    const messages = await ChatMessage_1.ChatMessageModel.find({ threadId }).sort({ createdAt: 1 });
    return messages.map(serialization_1.toChatMessage);
}
async function getNotifications(recruiterId) {
    const notifications = await Notification_1.NotificationModel.find({ userId: recruiterId })
        .sort({ createdAt: -1 })
        .limit(20);
    return notifications.map(serialization_1.toNotification);
}
async function getBootstrapData(recruiterId) {
    const recruiter = await User_1.UserModel.findById(recruiterId);
    if (!recruiter) {
        throw new app_error_1.AppError("Recruiter not found", 404);
    }
    const [dashboard, feed, saved, messages, interviews, notifications] = await Promise.all([
        (0, dashboard_service_1.getRecruiterDashboardSummary)(recruiterId),
        (0, candidate_service_1.getCandidateFeed)({ page: 1, limit: 25 }),
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
        feed: feed,
        saved,
        messages,
        interviews,
        notifications,
    };
}
