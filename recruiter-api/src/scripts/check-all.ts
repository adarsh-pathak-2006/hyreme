import { connectToDatabase } from "../config/db";
import { CandidateProfileModel } from "../models/CandidateProfile";
import fs from "fs/promises";
import path from "path";

async function diagnose() {
  console.log("Connecting to MongoDB...");
  await connectToDatabase();

  const candidates = await CandidateProfileModel.find({});
  console.log(`\nFound ${candidates.length} candidate profiles in database:`);
  console.log("==================================================");

  const uploadRoot = path.resolve(process.cwd(), "uploads");

  for (const candidate of candidates) {
    console.log(`\nCandidate: ${candidate.name}`);
    console.log(`Role: ${candidate.role}`);
    
    // Video URL check
    const videoUrl = candidate.videoUrl;
    console.log(`- Video URL: ${videoUrl || "None"}`);
    if (videoUrl) {
      if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
        console.log(`  Video Status: 🌐 Remote/Cloud Asset`);
      } else {
        const cleanPath = videoUrl.startsWith("/") ? videoUrl.slice(1) : videoUrl;
        const relativeFilename = cleanPath.startsWith("uploads/") ? cleanPath.split("uploads/")[1] : cleanPath;
        const absPath = path.resolve(uploadRoot, relativeFilename || "");
        try {
          await fs.access(absPath);
          console.log(`  Video Status: ✅ File exists on local disk`);
        } catch {
          console.log(`  Video Status: ❌ FILE IS MISSING on local disk!`);
        }
      }
    }

    // Resume URL check
    const resumeUrl = candidate.resumeUrl;
    console.log(`- Resume URL: ${resumeUrl || "None"}`);
    if (resumeUrl) {
      if (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://")) {
        console.log(`  Resume Status: 🌐 Remote/Cloud Asset`);
      } else {
        const cleanPath = resumeUrl.startsWith("/") ? resumeUrl.slice(1) : resumeUrl;
        const relativeFilename = cleanPath.startsWith("uploads/") ? cleanPath.split("uploads/")[1] : cleanPath;
        const absPath = path.resolve(uploadRoot, relativeFilename || "");
        try {
          await fs.access(absPath);
          console.log(`  Resume Status: ✅ File exists on local disk`);
        } catch {
          console.log(`  Resume Status: ❌ FILE IS MISSING on local disk!`);
        }
      }
    }
  }

  console.log("\n==================================================");
  console.log("Diagnostic complete.");
}

diagnose()
  .catch((err) => console.error("Diagnostic failed:", err))
  .finally(async () => {
    const { UserModel } = require("../models/User");
    await UserModel.db.close();
  });
