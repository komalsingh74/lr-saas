import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleCd: {
      type: String,
      unique: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    vehicleType: {
      type: String,
      required: true,
      enum: ["Truck", "Tempo", "Van", "Pickup", "Trailer", "Container", "Other"],
    },

    capacity: {
      type: Number,
      required: true, // in tons
    },

    ownerName: {
      type: String,
      trim: true,
    },

    ownerPhone: {
      type: String,
      trim: true,
    },

    // registrationDate: {
    //   type: Date,
    // },

    // 🔥 SaaS Core Field (same as Party)
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


// 🔥 Prevent duplicate vehicle in same company
vehicleSchema.index(
  { vehicleNumber: 1, companyId: 1 },
  { unique: true }
);

vehicleSchema.pre("save", async function () {
  if (!this.vehicleCd) {
    const counter = await Counter.findOneAndUpdate(
      { name: "vehicleCd" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.vehicleCd = `VEH${String(counter.seq).padStart(3, "0")}`;
  }
});

export default mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);