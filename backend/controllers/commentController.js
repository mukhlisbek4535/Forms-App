import { compare } from "bcryptjs";
import Comment from "../models/commentModel.js";
import { io } from "../server.js";

export const createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      template: req.params.templateId,
      author: req.user.userId,
    });

    await comment.populate("author", "name email");

    io.to(req.params.templateId).emit("new-comment", comment);

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      template: req.params.templateId,
    })
      .sort({ createdAt: 1 })
      .populate("author", "name");

    res.status(200).json({ message: comments });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};
