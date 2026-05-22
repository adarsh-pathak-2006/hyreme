import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/auth";
import { validateSession } from "../services/session.service";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const cookieToken = req.cookies.hyreme_access_token as string | undefined;
  const accessToken = cookieToken ?? token;

  if (!accessToken) {
    return next(new AppError("Authentication required", 401));
  }

  const payload = verifyAccessToken(accessToken);
  const session = await validateSession(payload.sessionId, payload.id);
  if (!session) {
    return next(new AppError("Session expired or revoked", 401));
  }

  req.user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    profileImage: payload.profileImage,
  };
  req.sessionId = payload.sessionId;
  return next();
}
