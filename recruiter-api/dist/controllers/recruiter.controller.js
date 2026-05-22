"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBootstrap = getBootstrap;
exports.getDashboard = getDashboard;
exports.getFeed = getFeed;
exports.getSaved = getSaved;
exports.getMessages = getMessages;
exports.postMessage = postMessage;
exports.getInterviews = getInterviews;
exports.postInterview = postInterview;
exports.getNotificationsController = getNotificationsController;
exports.getThreadMessagesController = getThreadMessagesController;
const shared_1 = require("@hyreme/shared");
const candidate_service_1 = require("../services/candidate.service");
const dashboard_service_1 = require("../services/dashboard.service");
const recruiter_service_1 = require("../services/recruiter.service");
const app_error_1 = require("../utils/app-error");
function getRecruiterId(req) {
    if (!req.user) {
        throw new app_error_1.AppError("Authentication required", 401);
    }
    return req.user.id;
}
async function getBootstrap(req, res) {
    res.json(await (0, recruiter_service_1.getBootstrapData)(getRecruiterId(req)));
}
async function getDashboard(req, res) {
    res.json(await (0, dashboard_service_1.getRecruiterDashboardSummary)(getRecruiterId(req)));
}
async function getFeed(req, res) {
    const query = shared_1.candidateFeedQuerySchema.parse(req.query);
    res.json(await (0, candidate_service_1.getCandidateFeed)(query));
}
async function getSaved(req, res) {
    res.json(await (0, recruiter_service_1.getSavedCandidates)(getRecruiterId(req)));
}
async function getMessages(req, res) {
    res.json(await (0, recruiter_service_1.getMessageThreads)(getRecruiterId(req)));
}
async function postMessage(req, res) {
    const payload = shared_1.sendMessageSchema.parse(req.body);
    res.status(201).json(await (0, recruiter_service_1.sendMessage)(getRecruiterId(req), payload.candidateId, payload.body));
}
async function getInterviews(req, res) {
    res.json(await (0, recruiter_service_1.getInterviewItems)(getRecruiterId(req)));
}
async function postInterview(req, res) {
    const payload = shared_1.scheduleMeetingSchema.parse(req.body);
    const ownerName = req.user?.name ?? "Recruiter";
    res.status(201).json(await (0, recruiter_service_1.scheduleInterview)(getRecruiterId(req), payload, ownerName));
}
async function getNotificationsController(req, res) {
    res.json(await (0, recruiter_service_1.getNotifications)(getRecruiterId(req)));
}
async function getThreadMessagesController(req, res) {
    res.json(await (0, recruiter_service_1.getThreadMessagesForRecruiter)(getRecruiterId(req), String(req.params.threadId)));
}
