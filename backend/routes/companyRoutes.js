import express from "express";
import upload from "../middleware/upload.js";
import {
  createCompany,
  getCurrentCompany,
  updateCompany,
  
} from "../controllers/companyController.js";
import { protect, requireSuperAdmin } from "../middleware/auth.js";
import { deleteCompany, getAllCompanies, getCompanyById, updateCompanyByAdmin } from "../controllers/superAdmin/companyAdminController.js";

const router = express.Router();

// POST /api/company/create - Create new company
router.post(
  "/create",
  protect, // 🔒 Ensure user is authenticated
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  createCompany
);

// GET /api/company/me - Get current user's company
router.get("/me", protect, getCurrentCompany);

// PUT /api/company/me - Update current user's company
const companyUpdateUpload = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

const conditionalUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.startsWith("multipart/form-data")) {
    return companyUpdateUpload(req, res, next);
  }
  return next();
};

router.put(
  "/me",
  protect,
  conditionalUpload,
  updateCompany
);

// 🔹 SUPER ADMIN ROUTES
// GET /api/company/admin/all - Get all companies (Super Admin)
router.get("/admin/all", protect, requireSuperAdmin, getAllCompanies);

// GET /api/company/admin/:id - Get company by ID (Super Admin)
router.get("/admin/:id", protect, requireSuperAdmin, getCompanyById);

// PUT /api/company/admin/:id - Update company by Super Admin
router.put("/admin/:id", protect, requireSuperAdmin, updateCompanyByAdmin);

// DELETE /api/company/admin/:id - Delete company (Super Admin)
router.delete("/admin/:id", protect, requireSuperAdmin, deleteCompany);

export default router;