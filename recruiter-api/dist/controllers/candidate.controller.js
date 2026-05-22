"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateBootstrapController = getCandidateBootstrapController;
exports.getCandidateProfileController = getCandidateProfileController;
exports.upsertCandidateProfileController = upsertCandidateProfileController;
exports.getCandidateMessagesController = getCandidateMessagesController;
exports.replyCandidateMessageController = replyCandidateMessageController;
exports.getCandidateInterviewsController = getCandidateInterviewsController;
exports.getCandidateNotificationsController = getCandidateNotificationsController;
exports.getCandidateThreadMessagesController = getCandidateThreadMessagesController;
const shared_1 = require("@hyreme/shared");
const zod_1 = require("zod");
const candidate_portal_service_1 = require("../services/candidate-portal.service");
const app_error_1 = require("../utils/app-error");
const candidateReplySchema = zod_1.z.object({
    body: zod_1.z.string().min(1).max(1000),
});
function getCandidateUserId(req) {
    if (!req.user) {
        throw new app_error_1.AppError("Authentication required", 401);
    }
    if (req.user.role !== "candidate") {
        throw new app_error_1.AppError("Candidate access required", 403);
    }
    return req.user.id;
}
async function getCandidateBootstrapController(req, res) {
    res.json(await (0, candidate_portal_service_1.getCandidateBootstrap)(getCandidateUserId(req)));
}
async function getCandidateProfileController(req, res) {
    res.json({ profile: await (0, candidate_portal_service_1.getCandidateProfileForUser)(getCandidateUserId(req)) });
}
async function upsertCandidateProfileController(req, res) {
    const payload = shared_1.createCandidateProfileSchema.parse(req.body);
    res.json({
        profile: await (0, candidate_portal_service_1.upsertCandidateProfile)(getCandidateUserId(req), payload),
    });
}
async function getCandidateMessagesController(req, res) {
    const bootstrap = await (0, candidate_portal_service_1.getCandidateBootstrap)(getCandidateUserId(req));
    res.json(bootstrap.messages);
}
async function replyCandidateMessageController(req, res) {
    const payload = candidateReplySchema.parse(req.body);
    const userId = getCandidateUserId(req);
    const profile = await (0, candidate_portal_service_1.getCandidateProfileForUser)(userId);
    if (!profile) {
        throw new app_error_1.AppError("Candidate profile not found", 404);
    }
    const thread = await (0, candidate_portal_service_1.replyToThread)(profile.id, String(req.params.threadId), payload.body);
    res.status(201).json(thread);
}
async function getCandidateInterviewsController(req, res) {
    const userId = getCandidateUserId(req);
    const profile = await (0, candidate_portal_service_1.getCandidateProfileForUser)(userId);
    res.json(profile ? await (0, candidate_portal_service_1.getCandidateInterviews)(profile.id) : []);
}
async function getCandidateNotificationsController(req, res) {
    res.json(await (0, candidate_portal_service_1.getCandidateNotifications)(getCandidateUserId(req)));
}
async function getCandidateThreadMessagesController(req, res) {
    const userId = getCandidateUserId(req);
    const profile = await (0, candidate_portal_service_1.getCandidateProfileForUser)(userId);
    if (!profile) {
        throw new app_error_1.AppError("Candidate profile not found", 404);
    }
    res.json(await (0, candidate_portal_service_1.getThreadMessagesForCandidate)(profile.id, String(req.params.threadId)));
}
