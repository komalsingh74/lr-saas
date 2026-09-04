import Plan from "../models/Plan.js";

const DEFAULT_PLANS = [
    {
        name: "Basic",
        key: "basic",
        price: 499,
        users: "10 Users",
        companies: 25,
        description: "Best for small teams getting started.",
        features: ["LR Create", "LR List", "Basic Reports"],
        popular: false,
        active: true,
    },
    {
        name: "Professional",
        key: "pro",
        price: 999,
        users: "25 Users",
        companies: 15,
        description: "Most popular for growing teams.",
        features: ["All Basic", "Advanced Reports", "Analytics"],
        popular: true,
        active: true,
    },
    {
        name: "Enterprise",
        key: "enterprise",
        price: 1499,
        users: "Unlimited",
        companies: 8,
        description: "For larger organizations with advanced access.",
        features: ["All Features", "Priority Support", "Custom Access"],
        popular: false,
        active: true,
    },
];

const normalizePlanPayload = (body) => {
    const name = String(body.name || "").trim();
    const key = String(body.key || body.id || name.toLowerCase().replace(/\s+/g, "-")).trim().toLowerCase();

    return {
        name,
        key,
        price: Number(body.price || 0),
        currency: String(body.currency || "INR").toUpperCase(),
        users: String(body.users || "10 Users"),
        companies: Number(body.companies || 0),
        description: String(body.description || ""),
        features: Array.isArray(body.features)
            ? body.features.map((item) => String(item).trim()).filter(Boolean)
            : String(body.features || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        popular: Boolean(body.popular),
        active: body.active !== false,
    };
};

export const seedDefaultPlans = async () => {
    const count = await Plan.countDocuments();
    if (count > 0) return;

    await Plan.insertMany(DEFAULT_PLANS);
};

export const getPlans = async (req, res) => {
    try {
        await seedDefaultPlans();

        const plans = await Plan.find({ active: true }).sort({ popular: -1, price: 1 });

        res.json({
            success: true,
            data: plans,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllPlans = async (req, res) => {
    try {
        await seedDefaultPlans();

        const plans = await Plan.find().sort({ popular: -1, price: 1 });

        res.json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPlan = async (req, res) => {
    try {
        const payload = normalizePlanPayload(req.body);

        if (!payload.name || !payload.key) {
            return res.status(400).json({ success: false, message: "Plan name and key are required." });
        }

        const existing = await Plan.findOne({ key: payload.key });
        if (existing) {
            return res.status(409).json({ success: false, message: "Plan key already exists." });
        }

        const plan = await Plan.create(payload);

        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePlan = async (req, res) => {
    try {
        const payload = normalizePlanPayload(req.body);

        const plan = await Plan.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found." });
        }

        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);

        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found." });
        }

        res.json({ success: true, message: "Plan deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
