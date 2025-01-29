import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coldStorage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ColdStorage",
    required: true,
  },
  compartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Compartment",
    required: true,
  },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  storageStartDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
});

export default mongoose.model("Inventory", inventorySchema);
