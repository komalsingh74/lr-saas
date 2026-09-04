// ✅ Fix karo — auth.js
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;

  next();
});

// Super Admin middleware
export const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();
  if (role !== 'superadmin') {
    return next(new AppError("Access denied. Super admin only.", 403));
  }
  next();
});