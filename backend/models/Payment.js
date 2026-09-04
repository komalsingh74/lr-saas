import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        razorpayOrderId: String,

        razorpayPaymentId: String,

        method: String,

        amount: Number,

        plan: String,

        paidAt: Date,

        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);