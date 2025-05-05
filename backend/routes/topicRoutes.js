import express from "express";
import {
  createTopic,
  deleteTopic,
  getAllTopics,
  getTopicBySlug,
  updateTopic,
} from "../controllers/topicController.js";
import { verifyToken } from "../middleware/authMiddleWare.js";

const router = express.Router();

router.post("/", createTopic);
router.get("/", getAllTopics);
router.get("/:slug", getTopicBySlug);
router.put(":slug", verifyToken, updateTopic);
router.delete(":slug", verifyToken, deleteTopic);

export default router;
