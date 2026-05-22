import crypto from "crypto";
import type { Request } from "express";
import { env } from "../config/env";
import { SessionModel } from "../models/Session";

const REMEMBER_ME_TTL_MS =
  env.REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
const SESSION_ONLY_TTL_MS =
  env.SESSION_REFRESH_TOKEN_TTL_HOURS * 60 * 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createOpaqueToken() {
  return crypto.randomBytes(48).toString("hex");
}

function getRequestIp(request: Request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim();
  }

  return request.ip;
}

function getSessionTtlMs(rememberMe: boolean) {
  return rememberMe ? REMEMBER_ME_TTL_MS : SESSION_ONLY_TTL_MS;
}

export async function createSession(userId: string, request: Request, rememberMe = false) {
  const refreshToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + getSessionTtlMs(rememberMe));
  const session = await SessionModel.create({
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

export async function findSessionByRefreshToken(refreshToken: string) {
  return SessionModel.findOne({
    refreshTokenHash: hashToken(refreshToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function validateSession(sessionId: string, userId: string) {
  return SessionModel.findOne({
    _id: sessionId,
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function rotateSession(sessionId: string, request: Request) {
  const existingSession = await SessionModel.findById(sessionId);
  if (!existingSession) {
    return {
      session: null,
      refreshToken: "",
    };
  }

  const refreshToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + getSessionTtlMs(Boolean(existingSession.rememberMe)));
  const session = await SessionModel.findByIdAndUpdate(
    sessionId,
    {
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
      lastUsedAt: new Date(),
      userAgent: request.get("user-agent"),
      ipAddress: getRequestIp(request),
    },
    { new: true },
  );

  return {
    session,
    refreshToken,
  };
}

export async function revokeSessionById(sessionId: string) {
  await SessionModel.findByIdAndUpdate(sessionId, {
    revokedAt: new Date(),
  });
}

export async function revokeSessionByRefreshToken(refreshToken: string) {
  await SessionModel.findOneAndUpdate(
    { refreshTokenHash: hashToken(refreshToken) },
    { revokedAt: new Date() },
  );
}
