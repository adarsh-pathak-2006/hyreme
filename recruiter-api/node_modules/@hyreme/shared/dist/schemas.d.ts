import { z } from "zod";
export declare const userRoleSchema: z.ZodEnum<["candidate", "recruiter", "admin"]>;
export declare const recruiterLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const recruiterRegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    companyName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    companyName: string;
}, {
    email: string;
    password: string;
    name: string;
    companyName: string;
}>;
export declare const candidateLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const candidateRegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
}, {
    email: string;
    password: string;
    name: string;
}>;
export declare const otpRequestSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["candidate", "recruiter"]>;
    purpose: z.ZodEnum<["login", "register"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "candidate" | "recruiter";
    purpose: "login" | "register";
}, {
    email: string;
    role: "candidate" | "recruiter";
    purpose: "login" | "register";
}>;
export declare const otpVerifySchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["candidate", "recruiter"]>;
    purpose: z.ZodEnum<["login", "register"]>;
} & {
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
    role: "candidate" | "recruiter";
    purpose: "login" | "register";
}, {
    email: string;
    code: string;
    role: "candidate" | "recruiter";
    purpose: "login" | "register";
}>;
export declare const candidateFeedQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    skill: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    role?: string | undefined;
    skill?: string | undefined;
    location?: string | undefined;
}, {
    role?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    skill?: string | undefined;
    location?: string | undefined;
}>;
export declare const toggleSavedCandidateSchema: z.ZodObject<{
    candidateId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    candidateId: string;
}, {
    candidateId: string;
}>;
export declare const scheduleMeetingSchema: z.ZodObject<{
    candidateId: z.ZodString;
    date: z.ZodString;
    time: z.ZodString;
    mode: z.ZodString;
    note: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    candidateId: string;
    time: string;
    mode: string;
    note: string;
}, {
    date: string;
    candidateId: string;
    time: string;
    mode: string;
    note?: string | undefined;
}>;
export declare const sendMessageSchema: z.ZodObject<{
    candidateId: z.ZodString;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    candidateId: string;
    body: string;
}, {
    candidateId: string;
    body: string;
}>;
export declare const uploadAssetSchema: z.ZodObject<{
    kind: z.ZodEnum<["resume", "video"]>;
}, "strip", z.ZodTypeAny, {
    kind: "resume" | "video";
}, {
    kind: "resume" | "video";
}>;
export declare const createCandidateProfileSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodString;
    location: z.ZodString;
    headline: z.ZodString;
    skills: z.ZodArray<z.ZodString, "many">;
    matchScore: z.ZodNumber;
    experience: z.ZodString;
    salary: z.ZodString;
    availability: z.ZodString;
    introDuration: z.ZodString;
    introHook: z.ZodString;
    reelSummary: z.ZodString;
    preferredMeetingSlots: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    reelMoments: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    recruiterNote: z.ZodDefault<z.ZodString>;
    resumeUrl: z.ZodOptional<z.ZodString>;
    videoUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    socialLinks: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    role: string;
    location: string;
    headline: string;
    skills: string[];
    matchScore: number;
    experience: string;
    salary: string;
    availability: string;
    introDuration: string;
    introHook: string;
    reelSummary: string;
    preferredMeetingSlots: string[];
    reelMoments: string[];
    recruiterNote: string;
    resumeUrl?: string | undefined;
    videoUrl?: string | undefined;
    bio?: string | undefined;
    socialLinks?: Record<string, string> | undefined;
}, {
    name: string;
    role: string;
    location: string;
    headline: string;
    skills: string[];
    matchScore: number;
    experience: string;
    salary: string;
    availability: string;
    introDuration: string;
    introHook: string;
    reelSummary: string;
    preferredMeetingSlots?: string[] | undefined;
    reelMoments?: string[] | undefined;
    recruiterNote?: string | undefined;
    resumeUrl?: string | undefined;
    videoUrl?: string | undefined;
    bio?: string | undefined;
    socialLinks?: Record<string, string> | undefined;
}>;
