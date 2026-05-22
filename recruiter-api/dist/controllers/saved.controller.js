"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSaved = toggleSaved;
const shared_1 = require("@hyreme/shared");
const recruiter_service_1 = require("../services/recruiter.service");
const app_error_1 = require("../utils/app-error");
async function toggleSaved(req, res) {
    if (!req.user) {
        throw new app_error_1.AppError("Authentication required", 401);
    }
    const payload = shared_1.toggleSavedCandidateSchema.parse(req.body);
    res.json(await (0, recruiter_service_1.toggleSavedCandidate)(req.user.id, payload.candidateId));
}
