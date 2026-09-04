import express from "express";
import { protect, requireSuperAdmin } from "../middleware/auth.js";

import {
    createOrder,
    verifyPayment,
    getTransactions,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);

router.post("/verify-payment", protect, verifyPayment);
router.get("/transactions", protect, requireSuperAdmin, getTransactions);

export default router;