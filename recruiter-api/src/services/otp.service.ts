import { AuthOtpModel } from "../models/AuthOtp";

function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function issueOtp(email: string, role: "candidate" | "recruiter", purpose: "login" | "register") {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await AuthOtpModel.findOneAndUpdate(
    { email: email.toLowerCase(), role, purpose },
    {
      email: email.toLowerCase(),
      role,
      purpose,
      code,
      expiresAt,
      verified: false,
    },
    { upsert: true, new: true },
  );

  return code;
}

export async function verifyOtp(email: string, role: "candidate" | "recruiter", purpose: "login" | "register", code: string) {
  const record = await AuthOtpModel.findOne({
    email: email.toLowerCase(),
    role,
    purpose,
  });

  if (!record) {
    return false;
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return false;
  }

  if (record.code !== code) {
    return false;
  }

  record.verified = true;
  await record.save();
  return true;
}

export async function consumeVerifiedOtp(
  email: string,
  role: "candidate" | "recruiter",
  purpose: "login" | "register",
) {
  const record = await AuthOtpModel.findOne({
    email: email.toLowerCase(),
    role,
    purpose,
    verified: true,
  });

  if (!record) {
    return false;
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return false;
  }

  await record.deleteOne();
  return true;
}
