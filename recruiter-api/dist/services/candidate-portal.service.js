"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateProfileForUser = getCandidateProfileForUser;
exports.upsertCandidateProfile = upsertCandidateProfile;
exports.getCandidateDashboardSummary = getCandidateDashboardSummary;
exports.getCandidateMessageThreads = getCandidateMessageThreads;
exports.replyToThread = replyToThread;
exports.getThreadMessagesForCandidate = getThreadMessagesForCandidate;
exports.getCandidateInterviews = getCandidateInterviews;
exports.getCandidateNotifications = getCandidateNotifications;
exports.getCandidateBootstrap = getCandidateBootstrap;
const CandidateProfile_1 = require("../models/CandidateProfile");
const ChatMessage_1 = require("../models/ChatMessage");
const Interview_1 = require("../models/Interview");
const MessageThread_1 = require("../models/MessageThread");
const Notification_1 = require("../models/Notification");
const SavedCandidate_1 = require("../models/SavedCandidate");
const User_1 = require("../models/User");
const app_error_1 = require("../utils/app-error");
const socket_service_1 = require("./socket.service");
const serialization_1 = require("./serialization");
async function getCandidateProfileForUser(userId) {
    const profile = await CandidateProfile_1.CandidateProfileModel.findOne({ userId });
    return profile ? (0, serialization_1.toCandidate)(profile) : null;
}
async function upsertCandidateProfile(userId, payload) {
    const profile = await CandidateProfile_1.CandidateProfileModel.findOneAndUpdate({ userId }, { ...payload, userId }, { new: true, upsert: true, setDefaultsOnInsert: true });
    const candidate = (0, serialization_1.toCandidate)(profile);
    (0, socket_service_1.emitToRole)("recruiter", "feed:updated", {
        candidateId: candidate.id,
        candidateName: candidate.name,
    });
    return candidate;
}
async function getCandidateDashboardSummary(candidateId) {
    const [savedCount, interviewCount, messageCount] = await Promise.all([
        SavedCandidate_1.SavedCandidateModel.countDocuments({ candidateId }),
        Interview_1.InterviewModel.countDocuments({ candidateId }),
        MessageThread_1.MessageThreadModel.countDocuments({ candidateId }),
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
async function getCandidateMessageThreads(candidateId) {
    const threads = await MessageThread_1.MessageThreadModel.find({ candidateId }).sort({ updatedAt: -1 });
    const recruiterIds = threads.map((thread) => thread.recruiterId);
    const recruiters = await User_1.UserModel.find({ _id: { $in: recruiterIds } });
    const recruitersById = new Map(recruiters.map((recruiter) => [recruiter._id.toString(), recruiter]));
    return threads.map((thread) => {
        const recruiter = recruitersById.get(thread.recruiterId.toString());
        return {
            ...(0, serialization_1.toMessageThread)(thread, recruiter?.name ?? "Recruiter", "Hiring Team"),
            recruiterId: thread.recruiterId.toString(),
            counterpartyName: recruiter?.name ?? "Recruiter",
            counterpartyRole: "Hiring Team",
            candidateName: recruiter?.name ?? "Recruiter",
            role: "Hiring Team",
        };
    });
}
async function replyToThread(candidateId, threadId, body) {
    const thread = await MessageThread_1.MessageThreadModel.findOne({ _id: threadId, candidateId });
    if (!thread) {
        throw new app_error_1.AppError("Message thread not found", 404);
    }
    thread.lastMessage = body;
    thread.status = "Awaiting recruiter reply";
    thread.updatedAtLabel = "Just now";
    await thread.save();
    const candidateProfile = await CandidateProfile_1.CandidateProfileModel.findById(candidateId);
    if (!candidateProfile) {
        throw new app_error_1.AppError("Candidate profile not found", 404);
    }
    const message = await ChatMessage_1.ChatMessageModel.create({
        threadId: thread._id,
        senderUserId: candidateProfile.userId,
        senderRole: "candidate",
        body,
    });
    await Notification_1.NotificationModel.create({
        userId: thread.recruiterId,
        type: "message",
        title: "Candidate replied",
        message: "A candidate replied to your hiring conversation.",
    });
    (0, socket_service_1.emitToUser)(thread.recruiterId.toString(), "messages:updated", {
        threadId: thread._id.toString(),
        message: (0, serialization_1.toChatMessage)(message),
    });
    (0, socket_service_1.emitToUser)(candidateProfile.userId.toString(), "messages:updated", {
        threadId: thread._id.toString(),
        message: (0, serialization_1.toChatMessage)(message),
    });
    return thread;
}
async function getThreadMessagesForCandidate(candidateId, threadId) {
    const thread = await MessageThread_1.MessageThreadModel.findOne({ _id: threadId, candidateId });
    if (!thread) {
        throw new app_error_1.AppError("Thread not found", 404);
    }
    const messages = await ChatMessage_1.ChatMessageModel.find({ threadId }).sort({ createdAt: 1 });
    return messages.map(serialization_1.toChatMessage);
}
async function getCandidateInterviews(candidateId) {
    const profile = await CandidateProfile_1.CandidateProfileModel.findById(candidateId);
    if (!profile) {
        return [];
    }
    const interviews = await Interview_1.InterviewModel.find({ candidateId }).sort({ createdAt: -1 });
    return interviews.map((interview) => (0, serialization_1.toInterviewItem)(interview, profile.name, profile.role));
}
async function getCandidateNotifications(userId) {
    const notifications = await Notification_1.NotificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20);
    return notifications.map(serialization_1.toNotification);
}
async function getCandidateBootstrap(userId) {
    const user = await User_1.UserModel.findById(userId);
    if (!user) {
        throw new app_error_1.AppError("Candidate not found", 404);
    }
    const profileDoc = await CandidateProfile_1.CandidateProfileModel.findOne({ userId });
    const profile = profileDoc ? (0, serialization_1.toCandidate)(profileDoc) : null;
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
        user: (0, serialization_1.toAuthUser)(user),
        profile,
        dashboard,
        messages,
        interviews,
        notifications,
    };
}
