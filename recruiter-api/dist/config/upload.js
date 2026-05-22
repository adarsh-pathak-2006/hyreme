"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.getUploadUrl = getUploadUrl;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const app_error_1 = require("../utils/app-error");
const uploadRoot = path_1.default.resolve(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadRoot)) {
    fs_1.default.mkdirSync(uploadRoot, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
        cb(null, `${Date.now()}-${safeName}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const isResume = file.mimetype === "application/pdf" ||
            file.mimetype === "application/msword" ||
            file.mimetype ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const isVideo = file.mimetype.startsWith("video/");
        if (isResume || isVideo) {
            cb(null, true);
            return;
        }
        cb(new app_error_1.AppError("Only resume documents and video files are allowed", 400));
    },
});
function getUploadUrl(filename) {
    return `/uploads/${filename}`;
}
