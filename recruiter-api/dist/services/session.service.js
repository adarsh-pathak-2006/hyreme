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
const env_1 = require("../config/env");
const Session_1 = require("../models/Session");
const REMEMBER_ME_TTL_MS = env_1.env.REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
const SESSION_ONLY_TTL_MS = env_1.env.SESSION_REFRESH_TOKEN_TTL_HOURS * 60 * 60 * 1000;
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
function getSessionTtlMs(rememberMe) {
    return rememberMe ? REMEMBER_ME_TTL_MS : SESSION_ONLY_TTL_MS;
}
async function createSession(userId, request, rememberMe = false) {
    const refreshToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + getSessionTtlMs(rememberMe));
    const session = await Session_1.SessionModel.create({
        userId,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt,
        rememberMe,
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
    const existingSession = await Session_1.SessionModel.findById(sessionId);
    if (!existingSession) {
        return {
            session: null,
            refreshToken: "",
        };
    }
    const refreshToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + getSessionTtlMs(Boolean(existingSession.rememberMe)));
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
