import express from "express";
import User from "../models/users.js";
import Template from "../models/templateModel.js";
import Response from "../models/responseModel.js";

const router = express.Router();

const computeAggregatedResults = (template, responses) => {
  return template.questions.map((question) => {
    const qResult = {
      questionText: question.questionText,
      questionType: question.questionType,
      summary: {},
    };

    const answers = responses
      .map((res) =>
        res.answers.find(
          (a) => a.questionId.toString() === question._id.toString()
        )
      )
      .filter(Boolean);

    switch (question.questionType) {
      case "number": {
        const nums = answers
          .map((a) => parseFloat(a.answerText))
          .filter((n) => !isNaN(n));
        const total = nums.reduce((sum, n) => sum + n, 0);
        qResult.summary = {
          average: nums.length ? (total / nums.length).toFixed(2) : 0,
          min: Math.min(...nums),
          max: Math.max(...nums),
          count: nums.length,
        };
        break;
      }
      case "checkbox":
      case "dropdown": {
        const counts = {};
        question.options.forEach((opt) => (counts[opt] = 0));
        answers.forEach((a) => {
          (a.selectedOptions || [a.answerText]).forEach((opt) => {
            if (counts[opt] !== undefined) counts[opt]++;
          });
        });
        qResult.summary = counts;
        break;
      }
      case "single-line":
      case "multi-line":
        qResult.summary = { responseCount: answers.length };
        break;
      default:
        qResult.summary = { note: "Unsupported type" };
    }

    return qResult;
  });
};

router.get("/odoo/templates/:token", async (req, res) => {
  try {
    const user = await User.findOne({ apiToken: req.params.token });
    if (!user) return res.status(401).json({ error: "Invalid API token" });

    const templates = await Template.find({ createdBy: user._id });

    const result = [];

    for (const template of templates) {
      const responses = await Response.find({ templateId: template._id });
      const aggregated = computeAggregatedResults(template, responses);
      result.push({
        author: user.name,
        templateTitle: template.title,
        questions: aggregated,
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("ODoo API error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
