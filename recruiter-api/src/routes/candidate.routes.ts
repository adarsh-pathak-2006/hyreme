import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/async-handler";
import {
  getCandidateBootstrapController,
  getCandidateInterviewsController,
  getCandidateMessagesController,
  getCandidateNotificationsController,
  getCandidateProfileController,
  getCandidateThreadMessagesController,
  replyCandidateMessageController,
  upsertCandidateProfileController,
} from "../controllers/candidate.controller";

const router = Router();

router.use(requireAuth);
router.get("/bootstrap", asyncHandler(getCandidateBootstrapController));
router.get("/profile", asyncHandler(getCandidateProfileController));
router.put("/profile", asyncHandler(upsertCandidateProfileController));
router.get("/messages", asyncHandler(getCandidateMessagesController));
router.get("/messages/:threadId", asyncHandler(getCandidateThreadMessagesController));
router.post("/messages/:threadId", asyncHandler(replyCandidateMessageController));
router.get("/interviews", asyncHandler(getCandidateInterviewsController));
router.get("/notifications", asyncHandler(getCandidateNotificationsController));

export default router;
