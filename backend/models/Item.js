import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const itemSchema = new mongoose.Schema(
  {
    itemCd: {
      type: String,
      unique: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    unit: {
      type: String,
      default: "KG", // default unit
    },

    hsnCode: {
      type: String,
      trim: true,
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

// 🔥 Prevent duplicate item in same company
itemSchema.index(
  { itemName: 1, companyId: 1 },
  { unique: true }
);

itemSchema.pre("save", async function () {
  if (!this.itemCd) {
    const counter = await Counter.findOneAndUpdate(
      { name: "itemCd" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.itemCd = `ITM${String(counter.seq).padStart(3, "0")}`;
  }
});

export default mongoose.models.Item || mongoose.model("Item", itemSchema);