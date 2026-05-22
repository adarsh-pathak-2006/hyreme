import type { Request, Response } from "express";
import { candidateFeedQuerySchema, scheduleMeetingSchema, sendMessageSchema } from "@hyreme/shared";
import { getCandidateFeed } from "../services/candidate.service";
import { getRecruiterDashboardSummary } from "../services/dashboard.service";
import {
  getBootstrapData,
  getInterviewItems,
  getMessageThreads,
  getNotifications,
  getSavedCandidates,
  getThreadMessagesForRecruiter,
  scheduleInterview,
  sendMessage,
} from "../services/recruiter.service";
import { AppError } from "../utils/app-error";

function getRecruiterId(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user.id;
}

export async function getBootstrap(req: Request, res: Response) {
  res.json(await getBootstrapData(getRecruiterId(req)));
}

export async function getDashboard(req: Request, res: Response) {
  res.json(await getRecruiterDashboardSummary(getRecruiterId(req)));
}

export async function getFeed(req: Request, res: Response) {
  const query = candidateFeedQuerySchema.parse(req.query);
  res.json(await getCandidateFeed(query));
}

export async function getSaved(req: Request, res: Response) {
  res.json(await getSavedCandidates(getRecruiterId(req)));
}

export async function getMessages(req: Request, res: Response) {
  res.json(await getMessageThreads(getRecruiterId(req)));
}

export async function postMessage(req: Request, res: Response) {
  const payload = sendMessageSchema.parse(req.body);
  res.status(201).json(await sendMessage(getRecruiterId(req), payload.candidateId, payload.body));
}

export async function getInterviews(req: Request, res: Response) {
  res.json(await getInterviewItems(getRecruiterId(req)));
}

export async function postInterview(req: Request, res: Response) {
  const payload = scheduleMeetingSchema.parse(req.body);
  const ownerName = req.user?.name ?? "Recruiter";
  res.status(201).json(await scheduleInterview(getRecruiterId(req), payload, ownerName));
}

export async function getNotificationsController(req: Request, res: Response) {
  res.json(await getNotifications(getRecruiterId(req)));
}

export async function getThreadMessagesController(req: Request, res: Response) {
  res.json(await getThreadMessagesForRecruiter(getRecruiterId(req), String(req.params.threadId)));
}
