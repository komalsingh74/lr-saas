import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createSupportRequest,
  getMySupportRequests,
  getCompanySupportRequests,
} from "../controllers/supportController.js";

const router = express.Router();

// Create support request for current user/company
router.post("/", protect, createSupportRequest);

// Get support requests submitted by current user
router.get("/me", protect, getMySupportRequests);

// Get all support requests for current user's company
router.get("/company", protect, getCompanySupportRequests);

export default router;
