import mongoose from "mongoose";

const compartmentSchema = new mongoose.Schema({
  coldStorage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ColdStorage",
    required: true,
  },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  temperature: { type: Number, required: true },
  currentInventory: { type: Number, default: 0 },
  category: {
    type: String,
    enum: ["fruits", "vegetables", "other"],
    required: true,
  },
});

export default mongoose.model("Compartment", compartmentSchema);
