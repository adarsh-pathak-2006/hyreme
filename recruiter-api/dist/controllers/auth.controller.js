"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterRegister = recruiterRegister;
exports.recruiterLogin = recruiterLogin;
exports.candidateRegister = candidateRegister;
exports.candidateLogin = candidateLogin;
exports.requestOtp = requestOtp;
exports.verifyOtpController = verifyOtpController;
exports.getSession = getSession;
exports.refreshSession = refreshSession;
exports.logout = logout;
const shared_1 = require("@hyreme/shared");
const RecruiterProfile_1 = require("../models/RecruiterProfile");
const AuthOtp_1 = require("../models/AuthOtp");
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const app_error_1 = require("../utils/app-error");
const auth_1 = require("../utils/auth");
const serialization_1 = require("../services/serialization");
const otp_service_1 = require("../services/otp.service");
const session_service_1 = require("../services/session.service");
function assertCompanyEmail(email) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || shared_1.PERSONAL_EMAIL_DOMAINS.includes(domain)) {
        throw new app_error_1.AppError("Use a company or professional email address", 400);
    }
}
function setAccessCookie(res, token) {
    res.cookie("hyreme_access_token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: env_1.env.NODE_ENV === "production",
        path: "/",
        maxAge: 15 * 60 * 1000,
    });
}
function setRefreshCookie(res, token) {
    res.cookie("hyreme_refresh_token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: env_1.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
function setSessionHintCookie(res, user) {
    res.cookie("hyreme_session", `${user.role}:${user.id}`, {
        httpOnly: false,
        sameSite: "strict",
        secure: env_1.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
async function requireVerifiedOtp(email, role, purpose) {
    if (!env_1.env.ENABLE_OTP) {
        return;
    }
    const verified = await (0, otp_service_1.consumeVerifiedOtp)(email, role, purpose);
    if (!verified) {
        throw new app_error_1.AppError("Verify the OTP code before continuing", 401);
    }
}
async function recruiterRegister(req, res) {
    const payload = shared_1.recruiterRegisterSchema.parse(req.body);
    assertCompanyEmail(payload.email);
    const existing = await User_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
        throw new app_error_1.AppError("User already exists", 409);
    }
    const user = await User_1.UserModel.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: await (0, auth_1.hashPassword)(payload.password),
        role: "recruiter",
    });
    await RecruiterProfile_1.RecruiterProfileModel.create({
        userId: user._id,
        companyName: payload.companyName,
        companyEmail: payload.email.toLowerCase(),
        verified: false,
    });
    const authUser = (0, serialization_1.toAuthUser)(user);
    const { session, refreshToken } = await (0, session_service_1.createSession)(authUser.id, req);
    const response = {
        accessToken: "",
        user: authUser,
    };
    setAccessCookie(res, (0, auth_1.signAccessToken)(authUser, session._id.toString()));
    setRefreshCookie(res, refreshToken);
    setSessionHintCookie(res, authUser);
    res.status(201).json(response);
}
async function recruiterLogin(req, res) {
    const payload = shared_1.recruiterLoginSchema.parse(req.body);
    const user = await User_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (!user || user.role !== "recruiter") {
        throw new app_error_1.AppError("Invalid recruiter credentials", 401);
    }
    const passwordMatches = await (0, auth_1.comparePassword)(payload.password, user.password);
    if (!passwordMatches) {
        throw new app_error_1.AppError("Invalid recruiter credentials", 401);
    }
    const authUser = (0, serialization_1.toAuthUser)(user);
    const { session, refreshToken } = await (0, session_service_1.createSession)(authUser.id, req);
    const response = {
        accessToken: "",
        user: authUser,
    };
    setAccessCookie(res, (0, auth_1.signAccessToken)(authUser, session._id.toString()));
    setRefreshCookie(res, refreshToken);
    setSessionHintCookie(res, authUser);
    res.json(response);
}
async function candidateRegister(req, res) {
    const payload = shared_1.candidateRegisterSchema.parse(req.body);
    await requireVerifiedOtp(payload.email, "candidate", "register");
    const existing = await User_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
        throw new app_error_1.AppError("User already exists", 409);
    }
    const user = await User_1.UserModel.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: await (0, auth_1.hashPassword)(payload.password),
        role: "candidate",
    });
    const authUser = (0, serialization_1.toAuthUser)(user);
    const { session, refreshToken } = await (0, session_service_1.createSession)(authUser.id, req);
    const response = {
        accessToken: "",
        user: authUser,
    };
    setAccessCookie(res, (0, auth_1.signAccessToken)(authUser, session._id.toString()));
    setRefreshCookie(res, refreshToken);
    setSessionHintCookie(res, authUser);
    res.status(201).json(response);
}
async function candidateLogin(req, res) {
    const payload = shared_1.candidateLoginSchema.parse(req.body);
    await requireVerifiedOtp(payload.email, "candidate", "login");
    const user = await User_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (!user || user.role !== "candidate") {
        throw new app_error_1.AppError("Invalid candidate credentials", 401);
    }
    const passwordMatches = await (0, auth_1.comparePassword)(payload.password, user.password);
    if (!passwordMatches) {
        throw new app_error_1.AppError("Invalid candidate credentials", 401);
    }
    const authUser = (0, serialization_1.toAuthUser)(user);
    const { session, refreshToken } = await (0, session_service_1.createSession)(authUser.id, req);
    const response = {
        accessToken: "",
        user: authUser,
    };
    setAccessCookie(res, (0, auth_1.signAccessToken)(authUser, session._id.toString()));
    setRefreshCookie(res, refreshToken);
    setSessionHintCookie(res, authUser);
    res.json(response);
}
async function requestOtp(req, res) {
    if (!env_1.env.ENABLE_OTP) {
        res.json({
            message: "OTP is currently disabled. Enable ENABLE_OTP=true to require it again.",
        });
        return;
    }
    const payload = shared_1.otpRequestSchema.parse(req.body);
    const email = payload.email.toLowerCase();
    if (payload.role === "recruiter" && payload.purpose === "register") {
        assertCompanyEmail(email);
    }
    const existingUser = await User_1.UserModel.findOne({ email });
    if (payload.purpose === "login" && !existingUser) {
        throw new app_error_1.AppError("No account found for this email", 404);
    }
    if (payload.purpose === "register" && existingUser) {
        throw new app_error_1.AppError("User already exists", 409);
    }
    await AuthOtp_1.AuthOtpModel.deleteMany({
        email,
        role: payload.role,
        purpose: payload.purpose,
    });
    const code = await (0, otp_service_1.issueOtp)(payload.email, payload.role, payload.purpose);
    res.json({
        message: "OTP generated",
        otpCode: code,
    });
}
async function verifyOtpController(req, res) {
    if (!env_1.env.ENABLE_OTP) {
        res.json({ message: "OTP is currently disabled." });
        return;
    }
    const payload = shared_1.otpVerifySchema.parse(req.body);
    const verified = await (0, otp_service_1.verifyOtp)(payload.email, payload.role, payload.purpose, payload.code);
    if (!verified) {
        throw new app_error_1.AppError("Invalid or expired OTP", 400);
    }
    res.json({ message: "OTP verified" });
}
async function getSession(req, res) {
    if (!req.user) {
        throw new app_error_1.AppError("Authentication required", 401);
    }
    res.json({ user: req.user });
}
async function refreshSession(req, res) {
    const refreshToken = req.cookies.hyreme_refresh_token;
    if (!refreshToken) {
        throw new app_error_1.AppError("Refresh token missing", 401);
    }
    const session = await (0, session_service_1.findSessionByRefreshToken)(refreshToken);
    if (!session) {
        throw new app_error_1.AppError("Refresh session invalid or expired", 401);
    }
    const user = await User_1.UserModel.findById(session.userId);
    if (!user) {
        throw new app_error_1.AppError("User not found for this session", 404);
    }
    const authUser = (0, serialization_1.toAuthUser)(user);
    const rotated = await (0, session_service_1.rotateSession)(session._id.toString(), req);
    if (!rotated.session) {
        throw new app_error_1.AppError("Unable to rotate session", 500);
    }
    setAccessCookie(res, (0, auth_1.signAccessToken)(authUser, rotated.session._id.toString()));
    setRefreshCookie(res, rotated.refreshToken);
    setSessionHintCookie(res, authUser);
    res.json({ accessToken: "", user: authUser });
}
async function logout(req, res) {
    const refreshToken = req.cookies.hyreme_refresh_token;
    if (refreshToken) {
        await (0, session_service_1.revokeSessionByRefreshToken)(refreshToken);
    }
    res.clearCookie("hyreme_access_token", {
        path: "/",
        sameSite: "strict",
        secure: env_1.env.NODE_ENV === "production",
    });
    res.clearCookie("hyreme_refresh_token", {
        path: "/",
        sameSite: "strict",
        secure: env_1.env.NODE_ENV === "production",
    });
    res.clearCookie("hyreme_session", {
        path: "/",
        sameSite: "strict",
        secure: env_1.env.NODE_ENV === "production",
    });
    res.status(204).send();
}
