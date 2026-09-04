import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const companySchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },
    gstNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    compCd: {
      type: String,
      unique: true,
      index: true,
    },

    // 🔹 BRANDING
    logo: {
      type: String, // URL (Cloudinary / S3)
    },

    signature: {
      type: String, // URL
    },

    // 🔹 ADDRESS (NESTED OBJECT ✅ BEST PRACTICE)
    address: {
      street: { type: String, trim: true, required: true },
      city: { type: String, trim: true, required: true },
      state: { type: String, trim: true, required: true },
      pincode: { type: String, trim: true, required: true },
      country: { type: String, default: "India" },
    },

    // 🔹 BUSINESS INFO
    website: {
      type: String,
      trim: true,
    },

    fleetSize: {
      type: Number,
      default: 0,
    },

    numberOfBranches: {
      type: Number,
      default: 1,
    },

    businessType: {
      type: String,
      enum: ["Sole Proprietorship", "Partnership", "Private Limited", "Public Limited", "LLP", "One Person Company", "Others"],
    },

    establishedYear: {
      type: Number,
    },

    // 🔹 SUBSCRIPTION INFO (FOR SUPER ADMIN)
    planType: {
      type: String,
      enum: ["TRIAL", "BASIC", "PRO", "ENTERPRISE"],
      default: "TRIAL"
    },

    subscriptionStatus: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "TRIAL", "CANCELLED"],
      default: "TRIAL"
    },

    planStartDate: Date,

    planExpiryDate: Date,

    subscriptionAmount: {
      type: Number,
      default: 0
    },

    // Payment Gateway IDs
    razorpayCustomerId: String,
    stripeCustomerId: String,

    lastPaymentDate: Date,

    nextBillingDate: Date,

    totalLRs: {
      type: Number,
      default: 0
    },

    totalRevenueGenerated: {
      type: Number,
      default: 0
    },

    selectedTemplate: {
      type: String,
      default: "classic"
    },

    receiptTemplateConfig: {
      type: Object,
      default: {}
    },

    supportPriority: {
      type: String,
      enum: ["NORMAL", "PRIORITY"],
      default: "NORMAL"
    },

    lastActivity: Date,

    // 🔹 OWNER (IMPORTANT 🔥)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔹 STATUS
    companyStatus: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BLOCKED"],
      default: "ACTIVE"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true, // 🔥 once set, change nahi hoga
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast search
companySchema.index({ "address.city": 1, companyName: 1 });


// 🔥 AUTO GENERATE COMP CODE (SEQUENTIAL)
companySchema.pre("save", async function () {
  if (!this.compCd) {
    const counter = await Counter.findOneAndUpdate(
      { name: "company" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.compCd = `COMP${counter.seq}`;
  }
});

export const Company = mongoose.models.Company || mongoose.model("Company", companySchema);