import { Router } from "express";
import authRoutes from "./auth.routes";
import candidateRoutes from "./candidate.routes";
import recruiterRoutes from "./recruiter.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/recruiter", recruiterRoutes);
router.use("/candidate", candidateRoutes);
router.use("/uploads", uploadRoutes);

router.get("/videos", (_req, res) => {
  res.status(501).json({ message: "Video upload and streaming APIs are reserved for the next phase." });
});

router.get("/chat", (_req, res) => {
  res.status(501).json({ message: "Real-time chat sockets are initialized in the API server layer." });
});

router.get("/analytics", (_req, res) => {
  res.status(501).json({ message: "Advanced analytics exports are reserved for the next phase." });
});

export default router;
