import express from "express";
import {
  createParty,
  getParties,
  filterParties,
  updateParty,
  deleteParty,
  getPartiesDropdown,
} from "../controllers/partyController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // 🔐 all routes protected

router.post("/", createParty);
router.post("/filter", filterParties);        // 📄 Filter + pagination + search
router.get("/", getParties);
router.get("/dropdown", getPartiesDropdown);  // Dropdown
router.put("/:id", updateParty);
router.delete("/:id", deleteParty);


export default router;