import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Company } from "../models/Company.js";


// 🔑 Generate Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      companyId: user.companyId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// 🟢 REGISTER
export const registerUser = asyncHandler(async (req, res, next) => {

  const { name, email, phone, password } = req.body;

  // ❗ validation
  if (!name || !phone || !password || !email) {
    return next(new AppError("Name, phone, email and password are required", 400));
  }

  // ❗ check existing user
  const existingUser = await User.findOne({
    $or: [{ phone }, { email }],
  });

  if (existingUser) {
    return next(new AppError("User already exists with this phone/email", 400));
  }

  // ✅ create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
  });

  // 🔑 token
  const token = generateToken(user);

  res.status(201).json({
    message: "User registered successfully",
    token,
    user,
  });
});


// 🔵 LOGIN (phone OR email)
export const loginUser = asyncHandler(async (req, res, next) => {
  const { phone, email, password } = req.body;

  if ((!phone && !email) || !password) {
    return next(new AppError("Phone/email and password required", 400));
  }

  const user = await User.findOne({
    $or: [{ phone }, { email }],
  }).populate("companyId", "compCd"); // 🔥 IMPORTANT

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = generateToken(user);

  // Update company last activity if user has a company
  if (user.companyId) {
    await Company.findByIdAndUpdate(user.companyId, {
      $set: { lastActivity: new Date() }
    });
  }

  console.log("🔥 LOGIN DEBUG:", {
    userId: user._id,
    companyId: user.companyId,
    compCd: user.companyId?.compCd || null,
  });

  res.status(200).json({
    token,
    user: {
      ...user.toObject(),
      compCd: user.companyId?.compCd || null, // ✅ THIS IS KEY
    },
  });
});

// 🔍 Get current logged-in user
export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ user });
});

// ✏️ Update profile (name and optional password)
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { name, currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (name) {
    user.name = name;
  }

  const passwordFieldsProvided = currentPassword || newPassword || confirmPassword;

  if (passwordFieldsProvided) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(
        new AppError(
          "Current password, new password, and confirm password are required to change password",
          400
        )
      );
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError("New password and confirm password do not match", 400));
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 401));
    }

    user.password = newPassword;
  }

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.status(200).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

