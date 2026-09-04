import express from "express";
import { registerUser, loginUser, getCurrentUser, updateUserProfile } from "../controllers/userController.js";
import {
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  resetUserPasswordByAdmin,
  deactivateUserByAdmin,
} from "../controllers/superAdmin/userAdminController.js";
import { protect, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// 🟢 REGISTER
router.post("/register", registerUser);

// 🔵 LOGIN
router.post("/login", loginUser);

// ✅ Current user and profile updates
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateUserProfile);

// 🔐 Super Admin user management
router.get("/admin/all", protect, requireSuperAdmin, getAllUsers);
router.get("/admin/:id", protect, requireSuperAdmin, getUserById);
router.put("/admin/:id", protect, requireSuperAdmin, updateUserByAdmin);
router.post("/admin/:id/reset-password", protect, requireSuperAdmin, resetUserPasswordByAdmin);
router.delete("/admin/:id", protect, requireSuperAdmin, deactivateUserByAdmin);

router.post("/logout", (req, res) => {
  res.status(200).json({
    message: "Logged out successfully",
  });
});

export default router;