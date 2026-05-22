import { connectToDatabase } from "../config/db";
import { env } from "../config/env";
import { CandidateProfileModel } from "../models/CandidateProfile";
import { InterviewModel } from "../models/Interview";
import { MessageThreadModel } from "../models/MessageThread";
import { NotificationModel } from "../models/Notification";
import { RecruiterProfileModel } from "../models/RecruiterProfile";
import { SavedCandidateModel } from "../models/SavedCandidate";
import { SessionModel } from "../models/Session";
import { UserModel } from "../models/User";
import { seedCandidates } from "../seed-data";
import { hashPassword } from "../utils/auth";

async function seed() {
  await connectToDatabase();

  await Promise.all([
    NotificationModel.deleteMany({}),
    MessageThreadModel.deleteMany({}),
    InterviewModel.deleteMany({}),
    SavedCandidateModel.deleteMany({}),
    RecruiterProfileModel.deleteMany({}),
    CandidateProfileModel.deleteMany({}),
    SessionModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);

  const recruiter = await UserModel.create({
    name: "Ritika Sharma",
    email: env.SEED_RECRUITER_EMAIL.toLowerCase(),
    password: await hashPassword(env.SEED_RECRUITER_PASSWORD),
    role: "recruiter",
  });

  await RecruiterProfileModel.create({
    userId: recruiter._id,
    companyName: "HYREME",
    companyEmail: recruiter.email,
    verified: true,
  });

  const candidateProfiles = [];
  for (const candidate of seedCandidates) {
    const user = await UserModel.create({
      name: candidate.name,
      email: `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@examplecandidate.com`,
      password: await hashPassword("Candidate@123"),
      role: "candidate",
    });

    const profile = await CandidateProfileModel.create({
      userId: user._id,
      ...candidate,
    });
    candidateProfiles.push(profile);
  }

  if (candidateProfiles[1]) {
    await SavedCandidateModel.create({
      recruiterId: recruiter._id,
      candidateId: candidateProfiles[1]._id,
    });
  }

  if (candidateProfiles[2]) {
    await SavedCandidateModel.create({
      recruiterId: recruiter._id,
      candidateId: candidateProfiles[2]._id,
    });
  }

  if (candidateProfiles[0]) {
    await MessageThreadModel.create({
      recruiterId: recruiter._id,
      candidateId: candidateProfiles[0]._id,
      status: "Awaiting recruiter reply",
      updatedAtLabel: "10 minutes ago",
      lastMessage:
        "Happy to share my architecture case study and can speak with your engineering manager tomorrow afternoon.",
    });
  }

  if (candidateProfiles[1]) {
    await InterviewModel.create({
      recruiterId: recruiter._id,
      candidateId: candidateProfiles[1]._id,
      stage: "Portfolio review",
      date: "Tue, 27 May",
      time: "4:30 PM",
      mode: "Zoom",
      owner: recruiter.name,
      meetingLink: "https://zoom.us/j/hyreme-demo",
      note: "Review fintech design system case studies.",
      status: "Scheduled",
    });
  }

  await NotificationModel.create({
    userId: recruiter._id,
    type: "system",
    title: "Seed complete",
    message: "Recruiter demo account and candidate records are ready.",
  });

  console.log("Seed complete");
  console.log(`Recruiter login: ${env.SEED_RECRUITER_EMAIL} / ${env.SEED_RECRUITER_PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await UserModel.db.close();
  });
