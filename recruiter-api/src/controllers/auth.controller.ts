import type { Request, Response } from "express";
import {
  otpRequestSchema,
  otpVerifySchema,
  candidateLoginSchema,
  candidateRegisterSchema,
  PERSONAL_EMAIL_DOMAINS,
  recruiterLoginSchema,
  recruiterRegisterSchema,
  type AuthResponse,
} from "@hyreme/shared";
import { RecruiterProfileModel } from "../models/RecruiterProfile";
import { AuthOtpModel } from "../models/AuthOtp";
import { UserModel } from "../models/User";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import {
  comparePassword,
  hashPassword,
  signAccessToken,
} from "../utils/auth";
import { toAuthUser } from "../services/serialization";
import { consumeVerifiedOtp, issueOtp, verifyOtp } from "../services/otp.service";
import {
  createSession,
  findSessionByRefreshToken,
  revokeSessionByRefreshToken,
  rotateSession,
} from "../services/session.service";

function assertCompanyEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    throw new AppError("Use a company or professional email address", 400);
  }
}

function getRefreshCookieOptions(rememberMe: boolean) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    ...(rememberMe
      ? { maxAge: env.REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000 }
      : {}),
  };
}

function getSessionHintCookieOptions(rememberMe: boolean) {
  return {
    httpOnly: false,
    sameSite: "strict" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    ...(rememberMe
      ? { maxAge: env.REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000 }
      : {}),
  };
}

function setAccessCookie(res: Response, token: string) {
  res.cookie("hyreme_access_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });
}

function setRefreshCookie(res: Response, token: string, rememberMe: boolean) {
  res.cookie("hyreme_refresh_token", token, getRefreshCookieOptions(rememberMe));
}

function setSessionHintCookie(
  res: Response,
  user: { id: string; role: string },
  rememberMe: boolean,
) {
  res.cookie(
    "hyreme_session",
    `${user.role}:${user.id}`,
    getSessionHintCookieOptions(rememberMe),
  );
}

async function requireVerifiedOtp(
  email: string,
  role: "candidate" | "recruiter",
  purpose: "login" | "register",
) {
  if (!env.ENABLE_OTP) {
    return;
  }

  const verified = await consumeVerifiedOtp(email, role, purpose);
  if (!verified) {
    throw new AppError("Verify the OTP code before continuing", 401);
  }
}

export async function recruiterRegister(req: Request, res: Response) {
  const payload = recruiterRegisterSchema.parse(req.body);
  const rememberMe = Boolean((req.body as { rememberMe?: boolean }).rememberMe);
  assertCompanyEmail(payload.email);

  const existing = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new AppError("User already exists", 409);
  }

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: await hashPassword(payload.password),
    role: "recruiter",
  });

  await RecruiterProfileModel.create({
    userId: user._id,
    companyName: payload.companyName,
    companyEmail: payload.email.toLowerCase(),
    verified: false,
  });

  const authUser = toAuthUser(user);
  const { session, refreshToken } = await createSession(authUser.id, req, rememberMe);
  const response: AuthResponse = {
    accessToken: "",
    user: authUser,
  };
  setAccessCookie(res, signAccessToken(authUser, session._id.toString()));
  setRefreshCookie(res, refreshToken, rememberMe);
  setSessionHintCookie(res, authUser, rememberMe);
  res.status(201).json(response);
}

export async function recruiterLogin(req: Request, res: Response) {
  const payload = recruiterLoginSchema.parse(req.body);
  const rememberMe = Boolean((req.body as { rememberMe?: boolean }).rememberMe);
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });

  if (!user || user.role !== "recruiter") {
    throw new AppError("Invalid recruiter credentials", 401);
  }

  const passwordMatches = await comparePassword(payload.password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid recruiter credentials", 401);
  }

  const authUser = toAuthUser(user);
  const { session, refreshToken } = await createSession(authUser.id, req, rememberMe);
  const response: AuthResponse = {
    accessToken: "",
    user: authUser,
  };
  setAccessCookie(res, signAccessToken(authUser, session._id.toString()));
  setRefreshCookie(res, refreshToken, rememberMe);
  setSessionHintCookie(res, authUser, rememberMe);
  res.json(response);
}

export async function candidateRegister(req: Request, res: Response) {
  const payload = candidateRegisterSchema.parse(req.body);
  const rememberMe = Boolean((req.body as { rememberMe?: boolean }).rememberMe);
  await requireVerifiedOtp(payload.email, "candidate", "register");

  const existing = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new AppError("User already exists", 409);
  }

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: await hashPassword(payload.password),
    role: "candidate",
  });

  const authUser = toAuthUser(user);
  const { session, refreshToken } = await createSession(authUser.id, req, rememberMe);
  const response: AuthResponse = {
    accessToken: "",
    user: authUser,
  };
  setAccessCookie(res, signAccessToken(authUser, session._id.toString()));
  setRefreshCookie(res, refreshToken, rememberMe);
  setSessionHintCookie(res, authUser, rememberMe);
  res.status(201).json(response);
}

export async function candidateLogin(req: Request, res: Response) {
  const payload = candidateLoginSchema.parse(req.body);
  const rememberMe = Boolean((req.body as { rememberMe?: boolean }).rememberMe);
  await requireVerifiedOtp(payload.email, "candidate", "login");
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });

  if (!user || user.role !== "candidate") {
    throw new AppError("Invalid candidate credentials", 401);
  }

  const passwordMatches = await comparePassword(payload.password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid candidate credentials", 401);
  }

  const authUser = toAuthUser(user);
  const { session, refreshToken } = await createSession(authUser.id, req, rememberMe);
  const response: AuthResponse = {
    accessToken: "",
    user: authUser,
  };
  setAccessCookie(res, signAccessToken(authUser, session._id.toString()));
  setRefreshCookie(res, refreshToken, rememberMe);
  setSessionHintCookie(res, authUser, rememberMe);
  res.json(response);
}

export async function requestOtp(req: Request, res: Response) {
  if (!env.ENABLE_OTP) {
    res.json({
      message: "OTP is currently disabled. Enable ENABLE_OTP=true to require it again.",
    });
    return;
  }

  const payload = otpRequestSchema.parse(req.body);
  const email = payload.email.toLowerCase();

  if (payload.role === "recruiter" && payload.purpose === "register") {
    assertCompanyEmail(email);
  }

  const existingUser = await UserModel.findOne({ email });
  if (payload.purpose === "login" && !existingUser) {
    throw new AppError("No account found for this email", 404);
  }

  if (payload.purpose === "register" && existingUser) {
    throw new AppError("User already exists", 409);
  }

  await AuthOtpModel.deleteMany({
    email,
    role: payload.role,
    purpose: payload.purpose,
  });

  const code = await issueOtp(payload.email, payload.role, payload.purpose);
  res.json({
    message: "OTP generated",
    otpCode: code,
  });
}

export async function verifyOtpController(req: Request, res: Response) {
  if (!env.ENABLE_OTP) {
    res.json({ message: "OTP is currently disabled." });
    return;
  }

  const payload = otpVerifySchema.parse(req.body);
  const verified = await verifyOtp(payload.email, payload.role, payload.purpose, payload.code);
  if (!verified) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  res.json({ message: "OTP verified" });
}

export async function getSession(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  res.json({ user: req.user });
}

export async function refreshSession(req: Request, res: Response) {
  const refreshToken = req.cookies.hyreme_refresh_token as string | undefined;
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const session = await findSessionByRefreshToken(refreshToken);
  if (!session) {
    throw new AppError("Refresh session invalid or expired", 401);
  }

  const user = await UserModel.findById(session.userId);
  if (!user) {
    throw new AppError("User not found for this session", 404);
  }

  const authUser = toAuthUser(user);
  const rotated = await rotateSession(session._id.toString(), req);
  if (!rotated.session) {
    throw new AppError("Unable to rotate session", 500);
  }

  const rememberMe = Boolean(rotated.session.rememberMe);
  setAccessCookie(res, signAccessToken(authUser, rotated.session._id.toString()));
  setRefreshCookie(res, rotated.refreshToken, rememberMe);
  setSessionHintCookie(res, authUser, rememberMe);
  res.json({ accessToken: "", user: authUser });
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.hyreme_refresh_token as string | undefined;
  if (refreshToken) {
    await revokeSessionByRefreshToken(refreshToken);
  }

  res.clearCookie("hyreme_access_token", {
    path: "/",
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
  });
  res.clearCookie("hyreme_refresh_token", {
    path: "/",
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
  });
  res.clearCookie("hyreme_session", {
    path: "/",
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
  });
  res.status(204).send();
}
