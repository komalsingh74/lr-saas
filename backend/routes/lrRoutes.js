import express from "express";
import {
  createLR,
  getLRById,
  getLRs,
  filterLRs,
  getLRSummary,
  getLRReportsStats,
  updateLR,
  deleteLR,
} from "../controllers/lrController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // 🔐 SaaS protection

router.post("/", createLR);
router.post("/filter", filterLRs);
router.get("/summary", getLRSummary);
router.get("/reports-stats", getLRReportsStats);
router.get("/", getLRs);
router.get("/:id", getLRById);
router.put("/:id", updateLR);
router.delete("/:id", deleteLR);

export default router;