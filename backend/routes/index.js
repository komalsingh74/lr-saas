import express from "express";
import userRoutes from "./userRoutes.js";
import companyRoutes from "./companyRoutes.js";
import itemsRoutes from "./itemRoutes.js";
import vehicleRoutes from "./vehicleRoutes.js";
import partyRoutes from "./partyRoutes.js";
import cityRoutes from "./cityRoutes.js";
import lrRoutes from "./lrRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import planRoutes from "./planRoutes.js";
import logRoutes from "./logRoutes.js";
import supportRoutes from "./supportRoutes.js";
import { getPublicLRByToken, getTrackingQr } from "../controllers/lrController.js";
const router = express.Router();
// User routes
router.use("/users", userRoutes);

router.use("/company", companyRoutes);

// Other routes (e.g., items, vehicles, parties, cities) will be added here similarly
router.use("/items", itemsRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/parties", partyRoutes);
router.use("/cities", cityRoutes);

router.use("/lr", lrRoutes);
router.get("/public/track/:token", getPublicLRByToken);
router.get("/public/track/qr/:token", getTrackingQr);

router.use("/payment", paymentRoutes);
router.use("/plans", planRoutes);
router.use("/logs", logRoutes);
router.use("/support", supportRoutes);

export default router;