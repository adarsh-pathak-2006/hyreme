import mongoose, { Schema, type InferSchemaType } from "mongoose";

const messageThreadSchema = new Schema(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "CandidateProfile", required: true },
    status: { type: String, default: "New message" },
    lastMessage: { type: String, required: true },
    updatedAtLabel: { type: String, required: true },
  },
  { timestamps: true },
);

messageThreadSchema.index({ recruiterId: 1, candidateId: 1 }, { unique: true });

export type MessageThreadDocument = InferSchemaType<typeof messageThreadSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MessageThreadModel =
  mongoose.models.MessageThread || mongoose.model("MessageThread", messageThreadSchema);
