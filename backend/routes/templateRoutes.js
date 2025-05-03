import express from "express";

import {
  getTemplateById,
  getTemplates,
  createTemplate,
  deleteTemplate,
  updateTemplateById,
  reOrderQuestions,
  searchTemplates,
  getPopularTemplates,
  toggleLikeTemplate,
  searchTemplatesByTag,
} from "../controllers/templateController.js";

import { verifyToken } from "../middleware/authMiddleWare.js";
import {
  adminOverRide,
  verifyOwnership,
} from "../middleware/adminMiddleware.js";
import Template from "../models/templateModel.js";
import {
  createComment,
  getComments,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", verifyToken, createTemplate);
router.get("/my", verifyToken, getTemplates);
router.get("/search", verifyToken, searchTemplates);
router.get("/popular", verifyToken, getPopularTemplates);
router.get("/searchByTag", verifyToken, searchTemplatesByTag);
router.get("/:templateId/comments", verifyToken, getComments);
router.post("/:templateId/comments", verifyToken, createComment);
router.post("/:templateId/like", verifyToken, toggleLikeTemplate);
router.get("/:id", verifyToken, getTemplateById);
router.delete(
  "/:templateId",
  verifyToken,
  adminOverRide,
  (req, res, next) => {
    req.model = Template;
    next();
  },
  verifyOwnership,
  deleteTemplate
);

router.put("/:id", verifyToken, updateTemplateById);
router.patch("/:id/reorder", verifyToken, reOrderQuestions);

export default router;
