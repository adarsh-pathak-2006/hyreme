import { z } from "zod";
import { USER_ROLES } from "./types";

export const userRoleSchema = z.enum(USER_ROLES);

export const recruiterLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const recruiterRegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  companyName: z.string().min(2).max(120),
});

export const candidateLoginSchema = recruiterLoginSchema;

export const candidateRegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const otpRequestSchema = z.object({
  email: z.string().email(),
  role: z.enum(["candidate", "recruiter"]),
  purpose: z.enum(["login", "register"]),
});

export const otpVerifySchema = otpRequestSchema.extend({
  code: z.string().length(6),
});

export const candidateFeedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  skill: z.string().optional(),
  location: z.string().optional(),
  role: z.string().optional(),
});

export const toggleSavedCandidateSchema = z.object({
  candidateId: z.string().min(1),
});

export const scheduleMeetingSchema = z.object({
  candidateId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  mode: z.string().min(1),
  note: z.string().max(500).default(""),
});

export const sendMessageSchema = z.object({
  candidateId: z.string().min(1),
  body: z.string().min(1).max(1000),
});

export const uploadAssetSchema = z.object({
  kind: z.enum(["resume", "video"]),
});

export const createCandidateProfileSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  location: z.string().min(2),
  headline: z.string().min(10),
  skills: z.array(z.string()).min(1),
  matchScore: z.number().min(0).max(100),
  experience: z.string().min(1),
  salary: z.string().min(1),
  availability: z.string().min(1),
  introDuration: z.string().min(1),
  introHook: z.string().min(1),
  reelSummary: z.string().min(1),
  preferredMeetingSlots: z.array(z.string()).default([]),
  reelMoments: z.array(z.string()).default([]),
  recruiterNote: z.string().default(""),
  resumeUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  bio: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
});
