import type { Request, Response } from "express";
import { createCandidateProfileSchema } from "@hyreme/shared";
import { z } from "zod";
import {
  getCandidateBootstrap,
  getCandidateInterviews,
  getCandidateMessageThreads,
  getCandidateNotifications,
  getCandidateProfileForUser,
  getThreadMessagesForCandidate,
  replyToThread,
  upsertCandidateProfile,
} from "../services/candidate-portal.service";
import { AppError } from "../utils/app-error";

const candidateReplySchema = z.object({
  body: z.string().min(1).max(1000),
});

function getCandidateUserId(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== "candidate") {
    throw new AppError("Candidate access required", 403);
  }

  return req.user.id;
}

export async function getCandidateBootstrapController(req: Request, res: Response) {
  res.json(await getCandidateBootstrap(getCandidateUserId(req)));
}

export async function getCandidateProfileController(req: Request, res: Response) {
  res.json({ profile: await getCandidateProfileForUser(getCandidateUserId(req)) });
}

export async function upsertCandidateProfileController(req: Request, res: Response) {
  const payload = createCandidateProfileSchema.parse(req.body);
  res.json({
    profile: await upsertCandidateProfile(getCandidateUserId(req), payload),
  });
}

export async function getCandidateMessagesController(req: Request, res: Response) {
  const bootstrap = await getCandidateBootstrap(getCandidateUserId(req));
  res.json(bootstrap.messages);
}

export async function replyCandidateMessageController(req: Request, res: Response) {
  const payload = candidateReplySchema.parse(req.body);
  const userId = getCandidateUserId(req);
  const profile = await getCandidateProfileForUser(userId);
  if (!profile) {
    throw new AppError("Candidate profile not found", 404);
  }

  const thread = await replyToThread(profile.id, String(req.params.threadId), payload.body);
  res.status(201).json(thread);
}

export async function getCandidateInterviewsController(req: Request, res: Response) {
  const userId = getCandidateUserId(req);
  const profile = await getCandidateProfileForUser(userId);
  res.json(profile ? await getCandidateInterviews(profile.id) : []);
}

export async function getCandidateNotificationsController(req: Request, res: Response) {
  res.json(await getCandidateNotifications(getCandidateUserId(req)));
}

export async function getCandidateThreadMessagesController(req: Request, res: Response) {
  const userId = getCandidateUserId(req);
  const profile = await getCandidateProfileForUser(userId);
  if (!profile) {
    throw new AppError("Candidate profile not found", 404);
  }

  res.json(await getThreadMessagesForCandidate(profile.id, String(req.params.threadId)));
}
