import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const partySchema = new mongoose.Schema(
  {
    partyCd: {
      type: String,
      unique: true,
      index: true,
    },
    partyName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },

    // 🔥 SaaS Core Field
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate party in same company
partySchema.index(
  { partyName: 1, phone: 1, companyId: 1 },
  { unique: true }
);

partySchema.pre("save", async function () {
  if (!this.partyCd) {
    const counter = await Counter.findOneAndUpdate(
      { name: "partyCd" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.partyCd = `PTY${String(counter.seq).padStart(3, "0")}`;
  }
});

export default mongoose.models.Party || mongoose.model("Party", partySchema);