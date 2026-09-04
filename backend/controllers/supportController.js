import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import Support from "../models/Support.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";

export const createSupportRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Not authorized", 401));
  }

  const { name, email, phone, subject, category, message } = req.body;

  if (!name || !email || !message) {
    return next(new AppError("Name, email and message are required", 400));
  }

  const user = await User.findById(userId).populate("companyId", "companyName compCd");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.companyId) {
    return next(new AppError("You must be associated with a company to submit support requests", 400));
  }

  const company = await Company.findById(user.companyId._id);

  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  const support = await Support.create({
    userId,
    companyId: company._id,
    companyName: company.companyName,
    compCd: company.compCd,
    userName: name,
    email,
    phone: phone || "",
    subject: subject || "",
    category: category || "other",
    message,
  });

  res.status(201).json({
    status: "success",
    message: "Support request submitted successfully",
    data: {
      support,
    },
  });
});

export const getMySupportRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Not authorized", 401));
  }

  const requests = await Support.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      supportRequests: requests,
    },
  });
});

export const getCompanySupportRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Not authorized", 401));
  }

  const user = await User.findById(userId);

  if (!user?.companyId) {
    return next(new AppError("You are not associated with any company", 400));
  }

  const requests = await Support.find({ companyId: user.companyId })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      supportRequests: requests,
    },
  });
});
