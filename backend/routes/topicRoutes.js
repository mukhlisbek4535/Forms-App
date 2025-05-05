import {
  createTopic,
  deleteTopic,
  getAllTopics,
  getTopicBySlug,
  updateTopic,
} from "../controllers/topicController";
import { verifyToken } from "../middleware/authMiddleWare";

const router = express.Router();

router.post("/", verifyToken, createTopic);
router.get("/", getAllTopics);
router.get("/:slug", getTopicBySlug);
router.put(":slug", verifyToken, updateTopic);
router.delete(":slug", verifyToken, deleteTopic);

export default router;
