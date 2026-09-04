import mongoose from "mongoose";
import { Counter } from "./Counter.js";
import crypto from "crypto";

const lrSchema = new mongoose.Schema(
  {
    lrNumber: {
      type: String,
      unique: true,
      required:true
    },

    trackingToken: {
      type: String,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["To Pay", "Paid"],
      default: "To Pay",
    },

    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered"],
      default: "Pending",
    },

    trackingRemarks: {
      type: String,
      maxlength: 200,
      trim: true,
      default: "",
    },

    trackingUpdatedAt: Date,

    consignor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },

    consignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },

    fromCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    toCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    driverName: String,

    transportMode: {
      type: String,
      enum: ["Road", "Rail", "Air"],
      default: "Road",
    },

    weight: Number,
    quantity: Number,

    freightAmount: {
      type: Number,
      default: 0,
    },

    taxable: {
      type: Boolean,
      default: false,
    },

    freightType: {
      type: String,
      enum: ["To Pay", "Paid", "TBB", "FOC"],
      default: "To Pay",
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },

    packagingType: String,
    noOfPackages: Number,
    invoiceNumber: String,
    ewayBillNo: String,

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Payment Gateway Fields (Future Ready)
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe"],
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


lrSchema.pre("save", async function () {
  if (!this.trackingToken) {
    this.trackingToken = crypto.randomBytes(24).toString("hex");
  }

  if (!this.lrNumber) {
    const counter = await Counter.findOneAndUpdate(
      { name: `LR-${this.companyId}` },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }  // new:true deprecated fix bhi
    );

    const padded = String(counter.seq).padStart(4, "0");
    this.lrNumber = `LR-${padded}`;
  }
});


export default mongoose.models.LR || mongoose.model("LR", lrSchema);