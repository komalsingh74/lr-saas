import express from "express";
import {
  createCity,
  // getCities,
  updateCity,
  deleteCity,
  getCitiesDropdown,
} from "../controllers/cityController.js";

import { protect } from "../middleware/auth.js";
import { filterCities } from "../controllers/cityController.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

// Routes
router.post("/", createCity);        // Create
router.post("/filter", filterCities);        // Get (with pagination + search)
router.get("/dropdown", getCitiesDropdown);  // Dropdown
router.put("/:id", updateCity);      // Update
router.delete("/:id", deleteCity);   // Delete

export default router;