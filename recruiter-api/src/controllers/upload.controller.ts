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

import { isCloudinaryEnabled, uploadToCloudinary } from "../services/cloudinary.service";

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

  // If Cloudinary is configured, stream raw file directly to cloud CDN and clean up local server disk!
  if (isCloudinaryEnabled()) {
    try {
      const resourceType = "auto";
      const cloudResult = await uploadToCloudinary(req.file.path, "hyreme", resourceType);
      await fs.unlink(req.file.path).catch(() => undefined);

      res.status(201).json({
        url: cloudResult.url,
        filename: cloudResult.publicId,
        kind: payload.kind,
      });
      return;
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local static serving:", err);
    }
  }

  // Zero-downtime local disk storage fallback if Cloudinary credentials aren't set
  const origin = `${req.protocol}://${req.get("host")}`;
  const filename = req.file.filename;

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
