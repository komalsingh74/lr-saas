import express from "express";
import {
  createItem,
  // getItems,
  updateItem,
  deleteItem,
  getItemsDropdown,
} from "../controllers/itemController.js";

import { protect } from "../middleware/auth.js";
import { filterItems } from "../controllers/itemController.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

router.post("/", createItem);       // Create
router.post("/filter", filterItems);        // List + pagination + search
router.get("/dropdown", getItemsDropdown); // Dropdown
router.put("/:id", updateItem);     // Update
router.delete("/:id", deleteItem);  // Delete

export default router;