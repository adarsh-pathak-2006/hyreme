"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const CandidateProfile_1 = require("../models/CandidateProfile");
const Interview_1 = require("../models/Interview");
const MessageThread_1 = require("../models/MessageThread");
const Notification_1 = require("../models/Notification");
const RecruiterProfile_1 = require("../models/RecruiterProfile");
const SavedCandidate_1 = require("../models/SavedCandidate");
const Session_1 = require("../models/Session");
const User_1 = require("../models/User");
const seed_data_1 = require("../seed-data");
const auth_1 = require("../utils/auth");
async function seed() {
    await (0, db_1.connectToDatabase)();
    await Promise.all([
        Notification_1.NotificationModel.deleteMany({}),
        MessageThread_1.MessageThreadModel.deleteMany({}),
        Interview_1.InterviewModel.deleteMany({}),
        SavedCandidate_1.SavedCandidateModel.deleteMany({}),
        RecruiterProfile_1.RecruiterProfileModel.deleteMany({}),
        CandidateProfile_1.CandidateProfileModel.deleteMany({}),
        Session_1.SessionModel.deleteMany({}),
        User_1.UserModel.deleteMany({}),
    ]);
    const recruiter = await User_1.UserModel.create({
        name: "Ritika Sharma",
        email: env_1.env.SEED_RECRUITER_EMAIL.toLowerCase(),
        password: await (0, auth_1.hashPassword)(env_1.env.SEED_RECRUITER_PASSWORD),
        role: "recruiter",
    });
    await RecruiterProfile_1.RecruiterProfileModel.create({
        userId: recruiter._id,
        companyName: "HYREME",
        companyEmail: recruiter.email,
        verified: true,
    });
    const candidateProfiles = [];
    for (const candidate of seed_data_1.seedCandidates) {
        const user = await User_1.UserModel.create({
            name: candidate.name,
            email: `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@examplecandidate.com`,
            password: await (0, auth_1.hashPassword)("Candidate@123"),
            role: "candidate",
        });
        const profile = await CandidateProfile_1.CandidateProfileModel.create({
            userId: user._id,
            ...candidate,
        });
        candidateProfiles.push(profile);
    }
    if (candidateProfiles[1]) {
        await SavedCandidate_1.SavedCandidateModel.create({
            recruiterId: recruiter._id,
            candidateId: candidateProfiles[1]._id,
        });
    }
    if (candidateProfiles[2]) {
        await SavedCandidate_1.SavedCandidateModel.create({
            recruiterId: recruiter._id,
            candidateId: candidateProfiles[2]._id,
        });
    }
    if (candidateProfiles[0]) {
        await MessageThread_1.MessageThreadModel.create({
            recruiterId: recruiter._id,
            candidateId: candidateProfiles[0]._id,
            status: "Awaiting recruiter reply",
            updatedAtLabel: "10 minutes ago",
            lastMessage: "Happy to share my architecture case study and can speak with your engineering manager tomorrow afternoon.",
        });
    }
    if (candidateProfiles[1]) {
        await Interview_1.InterviewModel.create({
            recruiterId: recruiter._id,
            candidateId: candidateProfiles[1]._id,
            stage: "Portfolio review",
            date: "Tue, 27 May",
            time: "4:30 PM",
            mode: "Zoom",
            owner: recruiter.name,
            meetingLink: "https://zoom.us/j/hyreme-demo",
            note: "Review fintech design system case studies.",
            status: "Scheduled",
        });
    }
    await Notification_1.NotificationModel.create({
        userId: recruiter._id,
        type: "system",
        title: "Seed complete",
        message: "Recruiter demo account and candidate records are ready.",
    });
    console.log("Seed complete");
    console.log(`Recruiter login: ${env_1.env.SEED_RECRUITER_EMAIL} / ${env_1.env.SEED_RECRUITER_PASSWORD}`);
}
seed()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(async () => {
    await User_1.UserModel.db.close();
});
