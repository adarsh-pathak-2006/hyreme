"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcodeVideoToMp4 = transcodeVideoToMp4;
exports.ensurePlayableVideoPath = ensurePlayableVideoPath;
exports.ensureVideoPosterPath = ensureVideoPosterPath;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const app_error_1 = require("../utils/app-error");
const directlyPlayableExtensions = new Set([".mp4", ".webm", ".ogg", ".ogv"]);
async function runFfmpegToMp4(inputPath, outputPath) {
    await promises_1.default.unlink(outputPath).catch(() => undefined);
    await new Promise((resolve, reject) => {
        const ffmpeg = (0, child_process_1.spawn)("ffmpeg", [
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
        throw new app_error_1.AppError(error instanceof Error
            ? `Video conversion failed: ${error.message}`
            : "Video conversion failed", 400);
    });
}
async function runFfmpegThumbnail(inputPath, outputPath) {
    await promises_1.default.unlink(outputPath).catch(() => undefined);
    await new Promise((resolve, reject) => {
        const ffmpeg = (0, child_process_1.spawn)("ffmpeg", [
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
        throw new app_error_1.AppError(error instanceof Error
            ? `Video thumbnail generation failed: ${error.message}`
            : "Video thumbnail generation failed", 400);
    });
}
async function transcodeVideoToMp4(inputPath) {
    const parsedPath = path_1.default.parse(inputPath);
    const outputFilename = parsedPath.ext.toLowerCase() === ".mp4"
        ? `${parsedPath.name}-normalized.mp4`
        : `${parsedPath.name}.mp4`;
    const outputPath = path_1.default.join(parsedPath.dir, outputFilename);
    await runFfmpegToMp4(inputPath, outputPath);
    await promises_1.default.unlink(inputPath).catch(() => undefined);
    return {
        outputPath,
        filename: path_1.default.basename(outputPath),
    };
}
async function ensurePlayableVideoPath(inputPath) {
    const extension = path_1.default.extname(inputPath).toLowerCase();
    if (directlyPlayableExtensions.has(extension)) {
        return inputPath;
    }
    const parsedPath = path_1.default.parse(inputPath);
    const outputPath = path_1.default.join(parsedPath.dir, `${parsedPath.name}.mp4`);
    try {
        await promises_1.default.access(outputPath);
        return outputPath;
    }
    catch {
        await runFfmpegToMp4(inputPath, outputPath);
        return outputPath;
    }
}
async function ensureVideoPosterPath(inputPath) {
    const parsedPath = path_1.default.parse(inputPath);
    const outputPath = path_1.default.join(parsedPath.dir, `${parsedPath.name}.jpg`);
    try {
        await promises_1.default.access(outputPath);
        return outputPath;
    }
    catch {
        await runFfmpegThumbnail(inputPath, outputPath);
        return outputPath;
    }
}
