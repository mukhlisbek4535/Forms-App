import express from "express";
import { updatePreferences } from "../controllers/preferenceController.js";
import { getPreferences } from "../controllers/preferenceController.js";
import { verifyToken } from "../middleware/authMiddleWare.js";

const router = express.Router();

router.get("/", verifyToken, getPreferences);
router.patch("/", verifyToken, updatePreferences);

export default router;
