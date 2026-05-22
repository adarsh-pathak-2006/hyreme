import mongoose, { Schema, type InferSchemaType } from "mongoose";

const savedCandidateSchema = new Schema(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "CandidateProfile", required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

savedCandidateSchema.index({ recruiterId: 1, candidateId: 1 }, { unique: true });

export type SavedCandidateDocument = InferSchemaType<typeof savedCandidateSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SavedCandidateModel =
  mongoose.models.SavedCandidate || mongoose.model("SavedCandidate", savedCandidateSchema);
