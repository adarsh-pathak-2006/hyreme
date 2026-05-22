import fs from "fs";
import path from "path";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { AppError } from "../utils/app-error";

const uploadRoot = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => cb(null, uploadRoot),
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isResume =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isVideo = file.mimetype.startsWith("video/");

    if (isResume || isVideo) {
      cb(null, true);
      return;
    }

    cb(new AppError("Only resume documents and video files are allowed", 400));
  },
});

export function getUploadUrl(filename: string) {
  return `/uploads/${filename}`;
}
