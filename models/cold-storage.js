import mongoose from "mongoose";

const coldStorageSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  address: { type: String, required: true },
  totalCapacity: { type: Number, required: true },
  availableCapacity: { type: Number, required: true },
  isApproved: { type: Boolean, default: false },
  rejectionHistory: [
    {
      reason: String,
      date: Date,
    },
  ],
});

coldStorageSchema.index({ location: "2dsphere" });
export default mongoose.model("ColdStorage", coldStorageSchema);
