import mongoose, { Schema, type InferSchemaType } from "mongoose";

const chatMessageSchema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "MessageThread", required: true },
    senderUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["candidate", "recruiter"], required: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

chatMessageSchema.index({ threadId: 1, createdAt: 1 });

export type ChatMessageDocument = InferSchemaType<typeof chatMessageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ChatMessageModel =
  mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
