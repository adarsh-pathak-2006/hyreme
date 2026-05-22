"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCandidateProfileSchema = exports.uploadAssetSchema = exports.sendMessageSchema = exports.scheduleMeetingSchema = exports.toggleSavedCandidateSchema = exports.candidateFeedQuerySchema = exports.otpVerifySchema = exports.otpRequestSchema = exports.candidateRegisterSchema = exports.candidateLoginSchema = exports.recruiterRegisterSchema = exports.recruiterLoginSchema = exports.userRoleSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("./types");
exports.userRoleSchema = zod_1.z.enum(types_1.USER_ROLES);
exports.recruiterLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.recruiterRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(120),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    companyName: zod_1.z.string().min(2).max(120),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.candidateLoginSchema = exports.recruiterLoginSchema;
exports.candidateRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(120),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.otpRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(["candidate", "recruiter"]),
    purpose: zod_1.z.enum(["login", "register"]),
});
exports.otpVerifySchema = exports.otpRequestSchema.extend({
    code: zod_1.z.string().length(6),
});
exports.candidateFeedQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(50).default(10),
    skill: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
});
exports.toggleSavedCandidateSchema = zod_1.z.object({
    candidateId: zod_1.z.string().min(1),
});
exports.scheduleMeetingSchema = zod_1.z.object({
    candidateId: zod_1.z.string().min(1),
    date: zod_1.z.string().min(1),
    time: zod_1.z.string().min(1),
    mode: zod_1.z.string().min(1),
    note: zod_1.z.string().max(500).default(""),
    meetingUrl: zod_1.z.string().url().optional(),
});
exports.sendMessageSchema = zod_1.z.object({
    candidateId: zod_1.z.string().min(1),
    body: zod_1.z.string().min(1).max(1000),
});
exports.uploadAssetSchema = zod_1.z.object({
    kind: zod_1.z.enum(["resume", "video"]),
});
exports.createCandidateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    role: zod_1.z.string().min(2),
    location: zod_1.z.string().min(2),
    headline: zod_1.z.string().min(10),
    skills: zod_1.z.array(zod_1.z.string()).min(1),
    matchScore: zod_1.z.number().min(0).max(100),
    experience: zod_1.z.string().min(1),
    salary: zod_1.z.string().min(1),
    availability: zod_1.z.string().min(1),
    introDuration: zod_1.z.string().min(1),
    introHook: zod_1.z.string().min(1),
    reelSummary: zod_1.z.string().min(1),
    preferredMeetingSlots: zod_1.z.array(zod_1.z.string()).default([]),
    reelMoments: zod_1.z.array(zod_1.z.string()).default([]),
    recruiterNote: zod_1.z.string().default(""),
    resumeUrl: zod_1.z.string().url().optional(),
    videoUrl: zod_1.z.string().url().optional(),
    bio: zod_1.z.string().optional(),
    socialLinks: zod_1.z.record(zod_1.z.string()).optional(),
});
