// routes/authRoutes.js
import express from "express";
import User from "../models/users.js";
import { verifyToken } from "../middleware/authMiddleWare.js";

const router = express.Router();

router.get("/verify", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email isAdmin"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token: req.token, // Optional: if you want to refresh the token here
    });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
