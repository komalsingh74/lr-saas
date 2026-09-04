import express from "express";
import { protect, requireSuperAdmin } from "../middleware/auth.js";
import {
    createPlan,
    deletePlan,
    getAllPlans,
    getPlans,
    updatePlan,
} from "../controllers/planController.js";

const router = express.Router();

router.get("/public", getPlans);
router.get("/", protect, requireSuperAdmin, getAllPlans);
router.post("/", protect, requireSuperAdmin, createPlan);
router.put("/:id", protect, requireSuperAdmin, updatePlan);
router.delete("/:id", protect, requireSuperAdmin, deletePlan);

export default router;
