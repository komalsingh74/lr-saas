import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        key: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        users: {
            type: String,
            default: "10 Users",
        },
        companies: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            default: "",
        },
        features: {
            type: [String],
            default: [],
        },
        popular: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Plan", planSchema, "plans");
