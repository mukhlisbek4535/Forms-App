import express from "express";
import submitResponse, {
  getAggregatedResultsByTemplateId,
  getResponsesByTemplateId,
} from "../controllers/responseController.js";
import { verifyToken } from "../middleware/authMiddleWare.js";
// import { responseAccess } from "../middleware/accessControl.js";

const router = express.Router();

router.post("/submit", verifyToken, submitResponse);
router.get(
  "/:templateId/results",
  verifyToken,
  getAggregatedResultsByTemplateId
);
router.get(
  "/:templateId",
  verifyToken,
  // responseAccess,
  getResponsesByTemplateId
);

export default router;
