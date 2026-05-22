import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/async-handler";
import {
  getBootstrap,
  getDashboard,
  getFeed,
  getInterviews,
  getMessages,
  getNotificationsController,
  getSaved,
  getThreadMessagesController,
  postInterview,
  postMessage,
} from "../controllers/recruiter.controller";
import { toggleSaved } from "../controllers/saved.controller";

const router = Router();

router.use(requireAuth);
router.get("/bootstrap", asyncHandler(getBootstrap));
router.get("/dashboard", asyncHandler(getDashboard));
router.get("/feed", asyncHandler(getFeed));
router.get("/saved", asyncHandler(getSaved));
router.post("/saved/toggle", asyncHandler(toggleSaved));
router.get("/messages", asyncHandler(getMessages));
router.get("/messages/:threadId", asyncHandler(getThreadMessagesController));
router.post("/messages", asyncHandler(postMessage));
router.get("/interviews", asyncHandler(getInterviews));
router.post("/interviews", asyncHandler(postInterview));
router.get("/notifications", asyncHandler(getNotificationsController));

export default router;
