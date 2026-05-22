"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const candidate_routes_1 = __importDefault(require("./candidate.routes"));
const recruiter_routes_1 = __importDefault(require("./recruiter.routes"));
const upload_routes_1 = __importDefault(require("./upload.routes"));
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
router.use("/auth", auth_routes_1.default);
router.use("/recruiter", recruiter_routes_1.default);
router.use("/candidate", candidate_routes_1.default);
router.use("/uploads", upload_routes_1.default);
router.get("/videos", (_req, res) => {
    res.status(501).json({ message: "Video upload and streaming APIs are reserved for the next phase." });
});
router.get("/chat", (_req, res) => {
    res.status(501).json({ message: "Real-time chat sockets are initialized in the API server layer." });
});
router.get("/analytics", (_req, res) => {
    res.status(501).json({ message: "Advanced analytics exports are reserved for the next phase." });
});
exports.default = router;
