import Template from "../models/templateModel.js";
import Response from "../models/responseModel.js";

const validateAnswers = (answer, question) => {
  switch (question.questionType) {
    case "number":
      if (isNaN(answer.answerText))
        return `Invalid answer for question type: ${question.questionType}`;
      if (answer.answerText < 0) return "Cannot be negative";
      break;
    case "checkbox":
      if (!Array.isArray(answer.selectedOptions))
        return `Invalid Selection for question type: ${question.questionType}`;
      break;
    case "single-line":
      if (answer.answerText.length > 200)
        return `Answer exceeds maximum length (200) for question type: ${question.questionType}`;
      break;
  }
  return null;
};

const isAdminOrOwner = (user, templateOwnerId) => {
  if (!user || !templateOwnerId) return false;
  return (
    user.isAdmin || user.userId?.toString() === templateOwnerId?.toString()
  );
};

const submitResponse = async (req, res) => {
  try {
    const { templateId, answers, templateVersion } = req.body;

    const template = await Template.findOne({
      _id: templateId,
      version: templateVersion,
    });
    if (!template)
      return res.status(404).json({
        message:
          "Template not found or OutDated. Please, try re-freshing the page",
      });

    if (
      !template.isPublic &&
      !template.accessList.includes(req.user.userId) &&
      template.createdBy.toString() !== req.user.userId.toString()
    )
      return res.status(403).json({ error: "Access denied" });

    const errors = [];

    for (const answer of answers) {
      const question = template.questions.id(answer.questionId);

      if (!question) {
        errors.push(`Question ID ${answer.questionId} not found`);
        continue;
      }

      if (question.required && !answer.answerText?.trim())
        errors.push(
          `Required question "${question.questionText}" is missing an answer`
        );

      const error = validateAnswers(answer, question);
      if (error) errors.push(error);
    }

    if (errors.length > 0) return res.status(400).json({ errors: errors });

    const response = new Response({
      templateId,
      userId: req.user ? req.user.userId : null,
      answers,
      version: template.version,
    });

    const newResponse = await response.save();
    await Template.findByIdAndUpdate(templateId, {
      $inc: { responseCount: 1 },
    });
    const { io } = await import("../server.js");

    io.to(templateId).emit("new-response", { templateId: templateId });

    res.status(200).json({
      name: req.user?.name || null,
      message: "Response successfully submitted",
      response: newResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export default submitResponse;

export const getResponsesByTemplateId = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await Template.findById(templateId);

    if (!template)
      return res.status(404).json({ message: "Template not found!" });

    // Can be used when the respondent is signed-in being authorized

    // if (req.user.userId !== template.userId.toString())
    //   return res.status(403).json({
    //     message: "Not authorized to view the responses for this template",
    //   });

    // Authorization check
    if (!isAdminOrOwner(req.user, template.createdBy)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const responses = await Response.find({
      templateId: template._id,
    }).populate("userId", "name");

    const ResponsesArray = responses.map((response) => {
      const questionAndAnswer = response.answers.map((answer) => {
        const question = template.questions.find(
          (q) => q._id.toString() === answer.questionId.toString()
        );
        return {
          questionText: question ? question.questionText : "Unknown Question",
          answerText: answer.answerText,
        };
      });

      return {
        respondent: response.userId?.name || "Anonymous",
        submittedAt: response.createdAt,
        answers: questionAndAnswer,
      };
    });

    res
      .status(200)
      .json({ templateTitle: template.title, responses: ResponsesArray });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};

// 🚩 Add this to your responseController.js
export const getAggregatedResultsByTemplateId = async (req, res) => {
  try {
    const { templateId } = req.params;

    // 1️⃣ Fetch the template and verify it exists
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    // 2️⃣ Check if requester is creator or admin
    // const isOwnerOrAdmin =
    //   req.user.isAdmin || req.user.userId === template.createdBy.toString();
    if (
      !template ||
      !template.createdBy ||
      !isAdminOrOwner(req.user, template.createdBy)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 3️⃣ Fetch all responses for this template
    const responses = await Response.find({ templateId });

    // 4️⃣ Set up result structure by question
    const results = template.questions.map((question) => {
      const qResult = {
        questionId: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        summary: {},
      };

      const answersToThisQuestion = responses
        .map((res) =>
          res.answers.find(
            (ans) => ans.questionId.toString() === question._id.toString()
          )
        )
        .filter(Boolean); // Remove undefineds

      // 5️⃣ Process based on question type
      switch (question.questionType) {
        case "checkbox":
          // For multiple selections
          const optionCounts = {};
          question.options.forEach((opt) => {
            optionCounts[opt] = 0;
          });

          answersToThisQuestion.forEach((ans) => {
            (ans.selectedOptions || []).forEach((opt) => {
              if (optionCounts.hasOwnProperty(opt)) {
                optionCounts[opt]++;
              }
            });
          });

          qResult.summary = optionCounts;
          break;

        case "dropdown":
          const dropdownCounts = {};
          question.options.forEach((opt) => {
            dropdownCounts[opt] = 0;
          });

          answersToThisQuestion.forEach((ans) => {
            if (dropdownCounts.hasOwnProperty(ans.answerText)) {
              dropdownCounts[ans.answerText]++;
            }
          });

          qResult.summary = dropdownCounts;
          break;

        case "number":
          const numbers = answersToThisQuestion
            .map((ans) => Number(ans.answerText))
            .filter((n) => !isNaN(n));

          const total = numbers.reduce((sum, n) => sum + n, 0);
          qResult.summary = {
            average: numbers.length ? (total / numbers.length).toFixed(2) : 0,
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            count: numbers.length,
          };
          break;

        case "single-line":
        case "multi-line":
          qResult.summary = {
            responseCount: answersToThisQuestion.length,
          };
          break;

        default:
          qResult.summary = { note: "Unsupported question type" };
      }

      return qResult;
    });

    res.status(200).json({ templateTitle: template.title, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
