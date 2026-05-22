import mongoose, { Schema, type InferSchemaType } from "mongoose";

const authOtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["candidate", "recruiter"], required: true },
    purpose: { type: String, enum: ["login", "register"], required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

authOtpSchema.index({ email: 1, role: 1, purpose: 1 }, { unique: true });

export type AuthOtpDocument = InferSchemaType<typeof authOtpSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AuthOtpModel =
  mongoose.models.AuthOtp || mongoose.model("AuthOtp", authOtpSchema);
