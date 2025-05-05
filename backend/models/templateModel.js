import { Schema } from "mongoose";
import mongoose from "mongoose";

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    required: true,
    enum: ["single-line", "multi-line", "number", "checkbox", "dropdown"],
  },
  options: {
    type: [String],
    default: [],
  },
  showInResults: { type: Boolean, default: false, required: true },
});

const templateSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    version: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      index: true,
      validate: [(tags) => tags.length <= 5, "Maximum 5 tags allowed"],
    },
    responseCount: { type: Number, default: 0 },
    questions: [questionSchema],
    createdAt: { type: Date, default: Date.now },
    accessList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

templateSchema.index({
  title: "text",
  description: "text",
  // topic: "text",
  "questions.questionText": "text",
  tags: "text",
});

const Template = mongoose.model("Template", templateSchema);
export default Template;
