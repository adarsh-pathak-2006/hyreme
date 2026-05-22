import { Router } from "express";
import { upload } from "../config/upload";
import {
  streamVideoPosterController,
  streamPlayableVideoController,
  uploadAssetController,
} from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/play/:filename", asyncHandler(streamPlayableVideoController));
router.get("/poster/:filename", asyncHandler(streamVideoPosterController));
router.post("/", requireAuth, upload.single("file"), asyncHandler(uploadAssetController));

export default router;
