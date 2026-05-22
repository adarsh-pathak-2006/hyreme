import mongoose, { Schema, type InferSchemaType } from "mongoose";

const recruiterProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    companyEmail: { type: String, required: true, trim: true, lowercase: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type RecruiterProfileDocument = InferSchemaType<typeof recruiterProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RecruiterProfileModel =
  mongoose.models.RecruiterProfile ||
  mongoose.model("RecruiterProfile", recruiterProfileSchema);
