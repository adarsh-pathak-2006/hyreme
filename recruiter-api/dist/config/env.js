"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const defaultClientOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
];
const booleanFromEnv = zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.string()])
    .transform((value) => {
    if (typeof value === "boolean") {
        return value;
    }
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
});
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z.coerce.number().default(4000),
    MONGODB_URI: zod_1.z
        .string()
        .min(1)
        .refine((value) => !value.includes("<db_password>") &&
        !value.includes("PASTE_YOUR_MONGODB_URI_HERE"), "MONGODB_URI must contain a real MongoDB connection string, not a placeholder value.")
        .default("mongodb://127.0.0.1:27017/hyreme"),
    CLIENT_ORIGIN: zod_1.z.string().default(defaultClientOrigins.join(",")),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16).default("hyreme-local-access-secret"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16).default("hyreme-local-refresh-secret"),
    ACCESS_TOKEN_TTL: zod_1.z.string().default("15m"),
    REFRESH_TOKEN_TTL: zod_1.z.string().default("7d"),
    ENABLE_OTP: booleanFromEnv.default(false),
    SEED_RECRUITER_EMAIL: zod_1.z.string().email().default("ritika@hyreme.io"),
    SEED_RECRUITER_PASSWORD: zod_1.z.string().min(8).default("Hyreme@123"),
});
const parsedEnv = envSchema.parse(process.env);
exports.env = {
    ...parsedEnv,
    CLIENT_ORIGINS: parsedEnv.CLIENT_ORIGIN.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
};
