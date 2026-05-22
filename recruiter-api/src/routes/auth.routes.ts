import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { env } from "../config/env";
import {
  candidateLogin,
  candidateRegister,
  getSession,
  logout,
  requestOtp,
  recruiterLogin,
  recruiterRegister,
  refreshSession,
  verifyOtpController,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/recruiter/register", asyncHandler(recruiterRegister));
router.post("/recruiter/login", asyncHandler(recruiterLogin));
router.post("/candidate/register", asyncHandler(candidateRegister));
router.post("/candidate/login", asyncHandler(candidateLogin));

if (env.ENABLE_OTP) {
  router.post("/otp/request", asyncHandler(requestOtp));
  router.post("/otp/verify", asyncHandler(verifyOtpController));
}

router.get("/me", requireAuth, asyncHandler(getSession));
router.post("/refresh", asyncHandler(refreshSession));
router.post("/logout", asyncHandler(logout));

export default router;
