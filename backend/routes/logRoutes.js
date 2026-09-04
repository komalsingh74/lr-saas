import express from "express";
import { protect, requireSuperAdmin } from "../middleware/auth.js";
import { getAllLogs } from "../controllers/superAdmin/logAdminController.js";

const router = express.Router();

router.get("/admin/all", protect, requireSuperAdmin, getAllLogs);

export default router;
