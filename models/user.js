import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: {
    type: String,
    enum: ["super", "storage", "customer"],
    required: true,
  },
  isApproved: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOTP: { type: String },
  otpExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
