import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import { Company } from "../models/Company.js";
import Plan from "../models/Plan.js";
import crypto from "crypto";

const FALLBACK_PLAN_PRICES = {
    basic: 499,
    pro: 999,
    enterprise: 1499,
};

const PLAN_TYPES = {
    basic: "BASIC",
    pro: "PRO",
    enterprise: "ENTERPRISE",
};

export const createOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        const { plan } = req.body;
        const normalizedPlan = String(plan || "").toLowerCase();

        const planRecord = await Plan.findOne({ key: normalizedPlan, active: true });
        const amount = Number(planRecord?.price || FALLBACK_PLAN_PRICES[normalizedPlan] || 0);

        if (!amount) {
            return res.status(400).json({
                message: "Invalid plan selected",
            });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId: req.user._id,
            companyId: req.user.companyId,
            amount,
            plan: normalizedPlan,
            razorpayOrderId: order.id,
            status: "created",
        });

        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            plan: normalizedPlan,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const totalResults = await Payment.countDocuments();
        const totalPages = Math.ceil(totalResults / limit) || 1;

        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("companyId", "companyName");

        const payload = payments.map((payment) => ({
            id: payment._id,
            company: payment.companyId?.companyName || "N/A",
            plan: payment.plan,
            amount: payment.amount,
            status: payment.status,
            method: payment.method || "Razorpay",
            date: payment.paidAt ? payment.paidAt : payment.createdAt,
            razorpayPaymentId: payment.razorpayPaymentId,
            razorpayOrderId: payment.razorpayOrderId,
        }));

        res.json({
            results: payload,
            page,
            limit,
            totalResults,
            totalPages,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");

        const isAuthentic =
            expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Payment signature mismatch",
            });
        }

        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                method: paymentDetails.method,
                paidAt: new Date(),
                status: "paid",
            },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found",
            });
        }

        const company = await Company.findById(payment.companyId);

        if (company) {
            const startDate = new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setDate(expiryDate.getDate() + 30);

            company.planType = PLAN_TYPES[payment.plan] || String(payment.plan || "").toUpperCase() || company.planType;
            company.subscriptionStatus = "ACTIVE";
            company.planStartDate = startDate;
            company.planExpiryDate = expiryDate;
            company.subscriptionAmount = payment.amount;
            company.lastPaymentDate = startDate;
            company.nextBillingDate = expiryDate;

            // Increment total revenue generated for the company
            company.totalRevenueGenerated = (company.totalRevenueGenerated || 0) + (payment.amount || 0);

            await company.save();
        }

        res.json({
            success: true,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};