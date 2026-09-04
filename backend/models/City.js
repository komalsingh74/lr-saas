import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const citySchema = new mongoose.Schema(
  {
    cityCd: {
      type: String,
      unique: true,
      index: true,
    },
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // optional (future use)
    isActive: {
      type: Boolean,
      default: true,
    },

  },
  {
    timestamps: true,
  }
);

// prevent duplicate city in same state
citySchema.index({ cityName: 1, state: 1, companyId: 1 }, { unique: true });

citySchema.pre("save", async function () {
  if (!this.cityCd) {
    const counter = await Counter.findOneAndUpdate(
      { name: "cityCd" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.cityCd = `CTY${String(counter.seq).padStart(3, "0")}`;
  }
});

export default mongoose.models.City || mongoose.model("City", citySchema);