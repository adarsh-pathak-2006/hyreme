"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const app_error_1 = require("../utils/app-error");
const auth_1 = require("../utils/auth");
const session_service_1 = require("../services/session.service");
async function requireAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const cookieToken = req.cookies.hyreme_access_token;
    const accessToken = cookieToken ?? token;
    if (!accessToken) {
        return next(new app_error_1.AppError("Authentication required", 401));
    }
    const payload = (0, auth_1.verifyAccessToken)(accessToken);
    const session = await (0, session_service_1.validateSession)(payload.sessionId, payload.id);
    if (!session) {
        return next(new app_error_1.AppError("Session expired or revoked", 401));
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
