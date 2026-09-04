import crypto from "crypto";
import asyncHandler from "../../utils/asyncHandler.js";
import AppError from "../../utils/appError.js";
import { User } from "../../models/User.js";
import { Company } from "../../models/Company.js";

// Get all users for Super Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 20,
        search,
        role = "user",
        status,
        companyId,
    } = req.query;

    const query = {};

    if (role && role.toLowerCase() !== "all") {
        const normalizedRole = String(role).toLowerCase();
        if (normalizedRole === "superadmin") {
            query.role = "superAdmin";
        } else if (normalizedRole === "user") {
            query.role = "user";
        }
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ];
    }

    if (status) {
        if (status.toLowerCase() === "active") {
            query.isActive = true;
        } else if (status.toLowerCase() === "inactive") {
            query.isActive = false;
        }
    }

    if (companyId) {
        query.companyId = companyId;
    }

    const pageNum = Number(page) >= 1 ? Number(page) : 1;
    const limitNum = Number(limit) >= 1 ? Number(limit) : 20;

    const [users, total] = await Promise.all([
        User.find(query)
            .populate("companyId", "companyName compCd planType subscriptionStatus")
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .select("-password -__v"),
        User.countDocuments(query),
    ]);

    const activeCount = await User.countDocuments({ ...query, isActive: true });
    const inactiveCount = await User.countDocuments({ ...query, isActive: false });

    res.status(200).json({
        status: "success",
        results: users.length,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalUsers: total,
        },
        stats: {
            activeUsers: activeCount,
            inactiveUsers: inactiveCount,
        },
        data: {
            users,
        },
    });
});

// Get a specific user by ID for Super Admin
export const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id)
        .populate("companyId", "companyName compCd")
        .select("-password -__v");

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

// Update a user as Super Admin
export const updateUserByAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, phone, role, companyId, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return next(new AppError("Email already in use", 400));
        }
        user.email = email;
    }

    if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return next(new AppError("Phone already in use", 400));
        }
        user.phone = phone;
    }

    if (name) {
        user.name = name;
    }

    if (role) {
        if (!["user", "superAdmin"].includes(role)) {
            return next(new AppError("Invalid role value", 400));
        }
        user.role = role;
    }

    if (companyId !== undefined) {
        if (companyId === null || companyId === "") {
            user.companyId = null;
        } else {
            const companyExists = await Company.findById(companyId);
            if (!companyExists) {
                return next(new AppError("Company not found", 404));
            }
            user.companyId = companyId;
        }
    }

    if (isActive !== undefined) {
        user.isActive = Boolean(isActive);
    }

    await user.save();

    const updatedUser = await User.findById(id)
        .populate("companyId", "companyName compCd planType subscriptionStatus")
        .select("-password -__v");

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
});

export const resetUserPasswordByAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const temporaryPassword = `Temp@${crypto.randomInt(100000, 999999)}`;
    user.password = temporaryPassword;
    user.isActive = true;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Temporary password generated successfully",
        data: {
            userId: user._id,
            temporaryPassword,
        },
    });
});

// Soft delete / deactivate user for Super Admin
export const deactivateUserByAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "User has been deactivated",
        data: {
            user: user.toObject(),
        },
    });
});
