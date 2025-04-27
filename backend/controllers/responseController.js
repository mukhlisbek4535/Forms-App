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
  return user.isAdmin || user.userId.toString() === templateOwnerId.toString();
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

    io.to(templateId).emit("new-reponse", { templateId: templateId });

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
