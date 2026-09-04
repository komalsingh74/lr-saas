import express from "express";
import {
  createVehicle,
  filterVehicles,
  updateVehicle,
  deleteVehicle,
  getVehiclesDropdown,
} from "../controllers/vehicleController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // 🔐 all routes protected

router.post("/", createVehicle);     // ➕ Create
router.post("/filter", filterVehicles); // 📄 Filter + pagination + search
router.get("/dropdown", getVehiclesDropdown); // Dropdown
router.put("/:id", updateVehicle);   // ✏️ Update
router.delete("/:id", deleteVehicle); // ❌ Delete

export default router;