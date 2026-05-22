import type { Request, Response } from "express";
import { toggleSavedCandidateSchema } from "@hyreme/shared";
import { toggleSavedCandidate } from "../services/recruiter.service";
import { AppError } from "../utils/app-error";

export async function toggleSaved(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const payload = toggleSavedCandidateSchema.parse(req.body);
  res.json(await toggleSavedCandidate(req.user.id, payload.candidateId));
}
