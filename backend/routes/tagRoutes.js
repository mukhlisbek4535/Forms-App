import express from "express";
import { getPopularTags, searchTags } from "../controllers/tagController.js";
const router = express.Router();

router.get("/", searchTags);
router.get("/popular", getPopularTags);
export default router;
