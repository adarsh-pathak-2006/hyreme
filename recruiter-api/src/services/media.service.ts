import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { AppError } from "../utils/app-error";

const directlyPlayableExtensions = new Set([".mp4", ".webm", ".ogg", ".ogv"]);

async function runFfmpegToMp4(inputPath: string, outputPath: string) {
  await fs.unlink(outputPath).catch(() => undefined);

  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputPath,
    ]);

    let stderr = "";

    ffmpeg.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `ffmpeg exited with code ${code ?? "unknown"}`));
    });
  }).catch((error) => {
    throw new AppError(
      error instanceof Error
        ? `Video conversion failed: ${error.message}`
        : "Video conversion failed",
      400,
    );
  });
}

async function runFfmpegThumbnail(inputPath: string, outputPath: string) {
  await fs.unlink(outputPath).catch(() => undefined);

  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-vf",
      "thumbnail,scale=720:-1",
      "-frames:v",
      "1",
      outputPath,
    ]);

    let stderr = "";

    ffmpeg.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", (error) => {
      reject(error);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `ffmpeg exited with code ${code ?? "unknown"}`));
    });
  }).catch((error) => {
    throw new AppError(
      error instanceof Error
        ? `Video thumbnail generation failed: ${error.message}`
        : "Video thumbnail generation failed",
      400,
    );
  });
}

export async function transcodeVideoToMp4(inputPath: string) {
  const parsedPath = path.parse(inputPath);
  const outputFilename =
    parsedPath.ext.toLowerCase() === ".mp4"
      ? `${parsedPath.name}-normalized.mp4`
      : `${parsedPath.name}.mp4`;
  const outputPath = path.join(parsedPath.dir, outputFilename);

  await runFfmpegToMp4(inputPath, outputPath);

  await fs.unlink(inputPath).catch(() => undefined);

  return {
    outputPath,
    filename: path.basename(outputPath),
  };
}

export async function ensurePlayableVideoPath(inputPath: string) {
  const extension = path.extname(inputPath).toLowerCase();

  if (directlyPlayableExtensions.has(extension)) {
    return inputPath;
  }

  const parsedPath = path.parse(inputPath);
  const outputPath = path.join(parsedPath.dir, `${parsedPath.name}.mp4`);

  try {
    await fs.access(outputPath);
    return outputPath;
  } catch {
    await runFfmpegToMp4(inputPath, outputPath);
    return outputPath;
  }
}

export async function ensureVideoPosterPath(inputPath: string) {
  const parsedPath = path.parse(inputPath);
  const outputPath = path.join(parsedPath.dir, `${parsedPath.name}.jpg`);

  try {
    await fs.access(outputPath);
    return outputPath;
  } catch {
    await runFfmpegThumbnail(inputPath, outputPath);
    return outputPath;
  }
}
