import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Counter } from "./Counter.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            required: [true, "Email is required"],
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
        },

        phone: {
            type: String,
            unique: true,
            required: [true, "Phone is required"],
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
        },
        // 🔗 Company relation (initially null)
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            default: null,
        },

        role: {
            type: String,
            enum: ["superAdmin", "user"], 
            default: "user",
        },

        companyRole: {
            type: String,
            enum: ["owner", "admin", "staff"],
            default: "owner",
        },
        userCd: {
            type: String,
            unique: true,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ email: 1 });

// 🔐 HASH PASSWORD BEFORE SAVE
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 COMPARE PASSWORD (LOGIN)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function () {
    if (!this.userCd) {
        const counter = await Counter.findOneAndUpdate(
            { name: "userCd" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.userCd = `USR${String(counter.seq).padStart(3, "0")}`;
    }
});


export const User = mongoose.models.User || mongoose.model("User", userSchema);