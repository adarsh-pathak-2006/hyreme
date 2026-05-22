import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultClientOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z
    .string()
    .min(1)
    .refine(
      (value) =>
        !value.includes("<db_password>") &&
        !value.includes("PASTE_YOUR_MONGODB_URI_HERE"),
      "MONGODB_URI must contain a real MongoDB connection string, not a placeholder value.",
    )
    .default("mongodb://127.0.0.1:27017/hyreme"),
  CLIENT_ORIGIN: z.string().default(defaultClientOrigins.join(",")),
  JWT_ACCESS_SECRET: z.string().min(16).default("hyreme-local-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("hyreme-local-refresh-secret"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  SESSION_REFRESH_TOKEN_TTL_HOURS: z.coerce.number().default(24),
  ENABLE_OTP: booleanFromEnv.default(false),
  SEED_RECRUITER_EMAIL: z.string().email().default("ritika@hyreme.io"),
  SEED_RECRUITER_PASSWORD: z.string().min(8).default("Hyreme@123"),
  CLOUDINARY_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  CLIENT_ORIGINS: parsedEnv.CLIENT_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
