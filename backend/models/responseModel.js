import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answerText: String,
  selectedOptions: [String],
  type: {
    type: String,
    enum: ["number", "checkbox", "single-line", "multi-line", "dropdown"],
    required: true,
  },
});

const responseSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    answers: [answerSchema],
  },
  { timestamps: true }
);

const Response = mongoose.model("Response", responseSchema);

export default Response;
