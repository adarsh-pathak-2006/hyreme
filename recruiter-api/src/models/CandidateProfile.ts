import mongoose, { Schema, type InferSchemaType } from "mongoose";

const candidateProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, required: true },
    headline: { type: String, required: true },
    skills: [{ type: String, required: true }],
    matchScore: { type: Number, required: true },
    experience: { type: String, required: true },
    salary: { type: String, required: true },
    availability: { type: String, required: true },
    introDuration: { type: String, required: true },
    introHook: { type: String, required: true },
    reelSummary: { type: String, required: true },
    preferredMeetingSlots: [{ type: String, default: [] }],
    reelMoments: [{ type: String, default: [] }],
    recruiterNote: { type: String, default: "" },
    resumeUrl: { type: String },
    videoUrl: { type: String },
    bio: { type: String },
    socialLinks: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

export type CandidateProfileDocument = InferSchemaType<typeof candidateProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CandidateProfileModel =
  mongoose.models.CandidateProfile ||
  mongoose.model("CandidateProfile", candidateProfileSchema);
