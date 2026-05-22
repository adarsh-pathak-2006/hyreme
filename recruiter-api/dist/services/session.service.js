"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.findSessionByRefreshToken = findSessionByRefreshToken;
exports.validateSession = validateSession;
exports.rotateSession = rotateSession;
exports.revokeSessionById = revokeSessionById;
exports.revokeSessionByRefreshToken = revokeSessionByRefreshToken;
const crypto_1 = __importDefault(require("crypto"));
const Session_1 = require("../models/Session");
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
function hashToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
function createOpaqueToken() {
    return crypto_1.default.randomBytes(48).toString("hex");
}
function getRequestIp(request) {
    const forwarded = request.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0]?.trim();
    }
    return request.ip;
}
async function createSession(userId, request) {
    const refreshToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const session = await Session_1.SessionModel.create({
        userId,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt,
        userAgent: request.get("user-agent"),
        ipAddress: getRequestIp(request),
        lastUsedAt: new Date(),
    });
    return {
        session,
        refreshToken,
    };
}
async function findSessionByRefreshToken(refreshToken) {
    return Session_1.SessionModel.findOne({
        refreshTokenHash: hashToken(refreshToken),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    });
}
async function validateSession(sessionId, userId) {
    return Session_1.SessionModel.findOne({
        _id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    });
}
async function rotateSession(sessionId, request) {
    const refreshToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const session = await Session_1.SessionModel.findByIdAndUpdate(sessionId, {
        refreshTokenHash: hashToken(refreshToken),
        expiresAt,
        lastUsedAt: new Date(),
        userAgent: request.get("user-agent"),
        ipAddress: getRequestIp(request),
    }, { new: true });
    return {
        session,
        refreshToken,
    };
}
async function revokeSessionById(sessionId) {
    await Session_1.SessionModel.findByIdAndUpdate(sessionId, {
        revokedAt: new Date(),
    });
}
async function revokeSessionByRefreshToken(refreshToken) {
    await Session_1.SessionModel.findOneAndUpdate({ refreshTokenHash: hashToken(refreshToken) }, { revokedAt: new Date() });
}
