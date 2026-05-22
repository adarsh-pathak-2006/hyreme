"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const async_handler_1 = require("../utils/async-handler");
const env_1 = require("../config/env");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/recruiter/register", (0, async_handler_1.asyncHandler)(auth_controller_1.recruiterRegister));
router.post("/recruiter/login", (0, async_handler_1.asyncHandler)(auth_controller_1.recruiterLogin));
router.post("/candidate/register", (0, async_handler_1.asyncHandler)(auth_controller_1.candidateRegister));
router.post("/candidate/login", (0, async_handler_1.asyncHandler)(auth_controller_1.candidateLogin));
if (env_1.env.ENABLE_OTP) {
    router.post("/otp/request", (0, async_handler_1.asyncHandler)(auth_controller_1.requestOtp));
    router.post("/otp/verify", (0, async_handler_1.asyncHandler)(auth_controller_1.verifyOtpController));
}
router.get("/me", auth_1.requireAuth, (0, async_handler_1.asyncHandler)(auth_controller_1.getSession));
router.post("/refresh", (0, async_handler_1.asyncHandler)(auth_controller_1.refreshSession));
router.post("/logout", (0, async_handler_1.asyncHandler)(auth_controller_1.logout));
exports.default = router;
