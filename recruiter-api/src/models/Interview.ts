import mongoose, { Schema, type InferSchemaType } from "mongoose";

const interviewSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "CandidateProfile", required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stage: { type: String, default: "Screening" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    meetingLink: { type: String },
    mode: { type: String, required: true },
    owner: { type: String, required: true },
    note: { type: String, default: "" },
    status: { type: String, default: "Scheduled" },
  },
  { timestamps: true },
);

export type InterviewDocument = InferSchemaType<typeof interviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InterviewModel =
  mongoose.models.Interview || mongoose.model("Interview", interviewSchema);
