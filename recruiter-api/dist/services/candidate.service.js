"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateFeed = getCandidateFeed;
const shared_1 = require("@hyreme/shared");
const CandidateProfile_1 = require("../models/CandidateProfile");
const serialization_1 = require("./serialization");
async function getCandidateFeed(params) {
    const query = {};
    if (params.skill) {
        query.skills = params.skill;
    }
    if (params.location) {
        query.location = new RegExp(params.location, "i");
    }
    if (params.role) {
        query.role = new RegExp(params.role, "i");
    }
    const docs = await CandidateProfile_1.CandidateProfileModel.find(query)
        .sort({ updatedAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit);
    const candidates = docs
        .map(serialization_1.toCandidate)
        .sort((left, right) => {
        const leftHasVideo = Boolean(left.videoUrl);
        const rightHasVideo = Boolean(right.videoUrl);
        if (leftHasVideo !== rightHasVideo) {
            return rightHasVideo ? 1 : -1;
        }
        return right.matchScore - left.matchScore;
    });
    return { candidates, filters: shared_1.FEED_FILTERS };
}
