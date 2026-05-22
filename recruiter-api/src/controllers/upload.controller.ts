import type { Request, Response } from "express";
import { uploadAssetSchema } from "@hyreme/shared";
import fs from "fs/promises";
import path from "path";
import { AppError } from "../utils/app-error";
import {
  ensurePlayableVideoPath,
  ensureVideoPosterPath,
  transcodeVideoToMp4,
} from "../services/media.service";

export async function uploadAssetController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (!req.file) {
    throw new AppError("File is required", 400);
  }

  const payload = uploadAssetSchema.parse(req.body);
  const isResumeUpload = payload.kind === "resume";
  const matchesKind = isResumeUpload
    ? [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(req.file.mimetype)
    : req.file.mimetype.startsWith("video/");

  if (!matchesKind) {
    await fs.unlink(req.file.path).catch(() => undefined);
    throw new AppError(
      isResumeUpload
        ? "Resume uploads must be PDF or Word documents"
        : "Video uploads must use a supported video format",
      400,
    );
  }

  const origin = `${req.protocol}://${req.get("host")}`;
  let filename = req.file.filename;

  // We bypass heavy video transcoding on the server in production to avoid hitting Render's 30s HTTP timeout limit,
  // high CPU restrictions, or triggering Out-Of-Memory (OOM) process termination on limited cloud tiers.
  // Modern browsers are fully capable of playing standard MP4/WebM videos natively!

  res.status(201).json({
    url: `${origin}/uploads/${filename}`,
    filename,
    kind: payload.kind,
  });
}

export async function streamPlayableVideoController(req: Request, res: Response) {
  const rawFilename = req.params.filename;
  const filename = Array.isArray(rawFilename) ? rawFilename[0] : rawFilename;

  if (!filename) {
    throw new AppError("Video not found", 404);
  }

  const uploadRoot = path.resolve(process.cwd(), "uploads");
  const inputPath = path.resolve(uploadRoot, filename);

  if (!inputPath.startsWith(uploadRoot)) {
    throw new AppError("Invalid video path", 400);
  }

  await fs.access(inputPath).catch(() => {
    throw new AppError("Video not found", 404);
  });

  const playablePath = await ensurePlayableVideoPath(inputPath);
  res.sendFile(playablePath);
}

export async function streamVideoPosterController(req: Request, res: Response) {
  const rawFilename = req.params.filename;
  const filename = Array.isArray(rawFilename) ? rawFilename[0] : rawFilename;

  if (!filename) {
    throw new AppError("Video not found", 404);
  }

  const uploadRoot = path.resolve(process.cwd(), "uploads");
  const inputPath = path.resolve(uploadRoot, filename);

  if (!inputPath.startsWith(uploadRoot)) {
    throw new AppError("Invalid video path", 400);
  }

  await fs.access(inputPath).catch(() => {
    throw new AppError("Video not found", 404);
  });

  const posterPath = await ensureVideoPosterPath(inputPath);
  res.sendFile(posterPath);
}
