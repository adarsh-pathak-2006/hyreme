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
    const videoUrl = candidate.videoUrl;
    console.log(`\nCandidate: ${candidate.name}`);
    console.log(`Role: ${candidate.role}`);
    console.log(`Video URL: ${videoUrl || "None (undefined/null)"}`);

    if (videoUrl) {
      if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
        console.log(`Result: 🌐 External Cloud URL (Should load from CDN)`);
      } else {
        // Local path check
        // Remove leading slash if present to avoid absolute path confusion
        const cleanPath = videoUrl.startsWith("/") ? videoUrl.slice(1) : videoUrl;
        const relativeFilename = cleanPath.startsWith("uploads/") 
          ? cleanPath.split("uploads/")[1] 
          : cleanPath;

        if (!relativeFilename) {
          console.log(`Result: ❌ Invalid URL format`);
          continue;
        }

        const absoluteDiskPath = path.resolve(uploadRoot, relativeFilename);
        try {
          await fs.access(absoluteDiskPath);
          console.log(`Result: ✅ File exists on server disk at: ${absoluteDiskPath}`);
        } catch {
          console.log(`Result: ❌ FILE IS MISSING on server disk! Checked: ${absoluteDiskPath}`);
        }
      }
    } else {
      console.log(`Result: ⚠️ Video is unavailable (Normal behavior - details only)`);
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
