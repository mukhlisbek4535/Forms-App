import Like from "../models/likeModel.js";
import Template from "../models/templateModel.js";
import { io } from "../server.js";

export const toggleLike = async (req, res) => {
  try {
    const templateId = req.params;

    const existing = await Like.findOne({
      template: templateId,
      user: req.user.userId,
    });

    let action;
    if (existing) {
      await existing.deleteOne();
      action = "removed";
    } else {
      await Like.create({
        template: templateId,
        user: req.user.userId,
      });
      action = "added";
    }

    const count = await Like.countDocuments({
      template: templateId,
    });

    io.to(templateId).emit("like-updated", { count, action });

    res
      .status(200)
      .json({ message: "Like toggled succesfully", action, count });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
