import type { Candidate, FeedResponse } from "@hyreme/shared";
import { FEED_FILTERS } from "@hyreme/shared";
import { CandidateProfileModel } from "../models/CandidateProfile";
import { toCandidate } from "./serialization";

type FeedParams = {
  page: number;
  limit: number;
  skill?: string;
  location?: string;
  role?: string;
};

export async function getCandidateFeed(params: FeedParams): Promise<FeedResponse> {
  const query: Record<string, unknown> = {};

  if (params.skill) {
    query.skills = params.skill;
  }

  if (params.location) {
    query.location = new RegExp(params.location, "i");
  }

  if (params.role) {
    query.role = new RegExp(params.role, "i");
  }

  const docs = await CandidateProfileModel.find(query)
    .sort({ updatedAt: -1 })
    .skip((params.page - 1) * params.limit)
    .limit(params.limit);

  const candidates: Candidate[] = docs
    .map(toCandidate)
    .sort((left, right) => {
      const leftHasVideo = Boolean(left.videoUrl);
      const rightHasVideo = Boolean(right.videoUrl);

      if (leftHasVideo !== rightHasVideo) {
        return rightHasVideo ? 1 : -1;
      }

      return right.matchScore - left.matchScore;
    });
  return { candidates, filters: FEED_FILTERS };
}
