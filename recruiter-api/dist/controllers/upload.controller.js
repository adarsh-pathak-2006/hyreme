"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAssetController = uploadAssetController;
exports.streamPlayableVideoController = streamPlayableVideoController;
exports.streamVideoPosterController = streamVideoPosterController;
const shared_1 = require("@hyreme/shared");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const app_error_1 = require("../utils/app-error");
const media_service_1 = require("../services/media.service");
async function uploadAssetController(req, res) {
    if (!req.user) {
        throw new app_error_1.AppError("Authentication required", 401);
    }
    if (!req.file) {
        throw new app_error_1.AppError("File is required", 400);
    }
    const payload = shared_1.uploadAssetSchema.parse(req.body);
    const isResumeUpload = payload.kind === "resume";
    const matchesKind = isResumeUpload
        ? [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(req.file.mimetype)
        : req.file.mimetype.startsWith("video/");
    if (!matchesKind) {
        await promises_1.default.unlink(req.file.path).catch(() => undefined);
        throw new app_error_1.AppError(isResumeUpload
            ? "Resume uploads must be PDF or Word documents"
            : "Video uploads must use a supported video format", 400);
    }
    const origin = `${req.protocol}://${req.get("host")}`;
    let filename = req.file.filename;
    if (!isResumeUpload) {
        const converted = await (0, media_service_1.transcodeVideoToMp4)(req.file.path);
        filename = converted.filename;
    }
    res.status(201).json({
        url: `${origin}/uploads/${filename}`,
        filename,
        kind: payload.kind,
    });
}
async function streamPlayableVideoController(req, res) {
    const rawFilename = req.params.filename;
    const filename = Array.isArray(rawFilename) ? rawFilename[0] : rawFilename;
    if (!filename) {
        throw new app_error_1.AppError("Video not found", 404);
    }
    const uploadRoot = path_1.default.resolve(process.cwd(), "uploads");
    const inputPath = path_1.default.resolve(uploadRoot, filename);
    if (!inputPath.startsWith(uploadRoot)) {
        throw new app_error_1.AppError("Invalid video path", 400);
    }
    await promises_1.default.access(inputPath).catch(() => {
        throw new app_error_1.AppError("Video not found", 404);
    });
    const playablePath = await (0, media_service_1.ensurePlayableVideoPath)(inputPath);
    res.sendFile(playablePath);
}
async function streamVideoPosterController(req, res) {
    const rawFilename = req.params.filename;
    const filename = Array.isArray(rawFilename) ? rawFilename[0] : rawFilename;
    if (!filename) {
        throw new app_error_1.AppError("Video not found", 404);
    }
    const uploadRoot = path_1.default.resolve(process.cwd(), "uploads");
    const inputPath = path_1.default.resolve(uploadRoot, filename);
    if (!inputPath.startsWith(uploadRoot)) {
        throw new app_error_1.AppError("Invalid video path", 400);
    }
    await promises_1.default.access(inputPath).catch(() => {
        throw new app_error_1.AppError("Video not found", 404);
    });
    const posterPath = await (0, media_service_1.ensureVideoPosterPath)(inputPath);
    res.sendFile(posterPath);
}
