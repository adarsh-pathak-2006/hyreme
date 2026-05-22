"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueOtp = issueOtp;
exports.verifyOtp = verifyOtp;
exports.consumeVerifiedOtp = consumeVerifiedOtp;
const AuthOtp_1 = require("../models/AuthOtp");
function generateOtpCode() {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
}
async function issueOtp(email, role, purpose) {
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await AuthOtp_1.AuthOtpModel.findOneAndUpdate({ email: email.toLowerCase(), role, purpose }, {
        email: email.toLowerCase(),
        role,
        purpose,
        code,
        expiresAt,
        verified: false,
    }, { upsert: true, new: true });
    return code;
}
async function verifyOtp(email, role, purpose, code) {
    const record = await AuthOtp_1.AuthOtpModel.findOne({
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
async function consumeVerifiedOtp(email, role, purpose) {
    const record = await AuthOtp_1.AuthOtpModel.findOne({
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
