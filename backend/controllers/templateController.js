import Template from "../models/templateModel.js";
import Response from "../models/responseModel.js";
import { validateQuestionTypes } from "../utils/validator.js";
import mongoose from "mongoose";
import { registerTags } from "./tagController.js";
import Topic from "../models/topicsModel.js";

export const createTemplate = async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      isPublic,
      questions,
      tags = [],
    } = req.body;

    if (!title || !questions || questions.length === 0)
      return res
        .status(400)
        .json({ message: "Title and questions are required." });

    const validationError = validateQuestionTypes(questions);
    if (validationError) return res.status(400).json(validationError);

    const topicExists = await Topic.findById(topic);
    if (!topicExists)
      return res.status(400).json({ message: "Invalid topic ID." });

    const template = new Template({
      title,
      description,
      topic,
      tags,
      isPublic,
      createdBy: req.user.userId,
      questions: questions.map((question, index) => ({
        ...question,
        order: index + 1,
      })),
      version: 0,
    });

    await template.save();
    await registerTags(tags);

    res.status(201).json({
      message: "Template created successfully.",
      template,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const reOrderQuestions = async (req, res) => {
  try {
    const { newOrder } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template)
      return res.status(404).json({ message: "Template not found." });

    const questionIds = template.questions.map((q) => q._id.toString());

    if (newOrder.some((id) => !questionIds.includes(id)))
      return res
        .status(400)
        .json({ message: "Invalid question IDs in new order." });

    const orderedQuestions = newOrder.map((id) =>
      template.questions.find((q) => q._id.toString() === id)
    );

    const updated = await Template.findByIdAndUpdate(
      req.params.id,
      {
        questions: orderedQuestions,
        $inc: { version: 1 },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Questions reordered successfully.",
      template: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Re-ordering failed",
      error: error.message,
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const filter = req.user.isAdmin
      ? {}
      : { $or: [{ createdBy: req.user.userId }, { isPublic: true }] };

    const templates = await Template.find(filter)
      .populate("createdBy", "_id email name")
      .populate("topic", "name description");
    res.status(200).json({
      message: "Templates fetched successfully.",
      templates,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).populate(
      "topic",
      "name description"
    );

    if (!template)
      return res.status(404).json({ message: "Template not found." });

    res
      .status(200)
      .json({ message: "Template fetched successfully.", template });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  // I should if i could delete the req.resource as it is already verified and stuck in the reqs.

  try {
    const { templateId } = req.params;
    const template = await Template.findById(templateId);

    if (!template)
      return res.status(404).json({ message: "Template not found." });

    await Response.deleteMany({ templateId });

    await Template.findByIdAndDelete(templateId);

    res
      .status(200)
      .json({ message: "Template and its responses deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, topic, isPublic, version, questions } =
      req.body;

    const template = await Template.findOne({
      _id: id,
      version: req.body.version,
    });

    if (!template)
      return res.status(404).json({
        message: "Template not found, or Template modified by another user.",
      });

    if (!isAdminOrOwner(req.user, template.createdBy))
      return res
        .status(403)
        .json({ message: "Unauthorized to update this template." });

    const existingResponses = await Response.exists({
      templateId: template._id,
    });
    if (existingResponses)
      return res.status(403).json({
        message:
          "Template cannot be updated as it has already 'Submitted' responses.",
      });

    if (topic) {
      const topicExists = await Topic.findById(topic);
      if (!topicExists)
        return res.status(400).json({ message: "Invalid topic ID." });
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        topic,
        isPublic,
        questions,
        $inc: { version: 1 },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Template updated successfully.",
      template: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Update Failed...",
      error: error.message,
    });
  }
};

///////////////////////////////////////////////////////////////////////////////
// Helper function to check if a user is the owner of a template
const isAdminOrOwner = (user, templateOwnerId) => {
  return user.isAdmin || user.userId.toString() === templateOwnerId.toString();
};
///////////////////////////////////////////////////////////////////////////////

export const searchTemplates = async (req, res) => {
  try {
    const templates = await Template.find(
      { $text: { $search: req.query.q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" }, responseCount: -1 })
      .limit(25);

    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({
      message: "Server Error. Search Failed...",
      error: error.message,
    });
  }
};

export const getPopularTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .sort({ responseCount: -1 })
      .limit(5)
      .select("title description image name responseCount")
      .populate("createdBy", "name");

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to get popular templates" });
  }
};

export const toggleLikeTemplate = async (req, res) => {
  try {
    const templateId = req.params.templateId;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const hasLiked = template.likedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (hasLiked) {
      await Template.findByIdAndUpdate(templateId, {
        $pull: { likedBy: userId },
      });
    } else {
      await Template.findByIdAndUpdate(templateId, {
        $addToSet: { likedBy: userId },
      });
    }

    const updatedTemplate = await Template.findById(templateId);

    const { io } = await import("../server.js");
    io.to(templateId).emit("template-liked", {
      templateId,
      likesCount: updatedTemplate.likedBy.length,
    });

    res.status(200).json({ likesCount: updatedTemplate.likedBy.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const searchTemplatesByTag = async (req, res) => {
  const { tag } = req.query;

  if (!tag || tag.trim() === "") {
    return res.status(400).json({ error: "Tag is required for search." });
  }

  try {
    const templates = await Template.find({
      isPublic: true,
      tags: { $regex: new RegExp(tag, "i") },
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.status(200).json({ templates });
  } catch (error) {
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};

export const getLatestTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("createdBy", "name")
      .select("title description image createdBy");

    res.status(200).json({ templates });
  } catch (error) {
    res.status(500).json({ error: "Failed to get latest templates" });
  }
};

export const searchTemplatesByFullTextQuery = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const searchRegex = new RegExp(q, "i");
    const filter = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    };

    const templates = await Template.find(filter)
      .populate("createdBy", "name")
      .populate("topic", "name");

    res.status(200).json({ templates });
  } catch (error) {
    console.error("Search failed", error);
    res.status(500).json({ message: "Server Error" });
  }
};
