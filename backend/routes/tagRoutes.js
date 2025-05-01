import express from "express";
import { searchTags } from "../controllers/tagController.js";
const router = express.Router();

router.get("/", searchTags);
export default router;
