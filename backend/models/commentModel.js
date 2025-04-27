import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 500, trim: true },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

commentSchema.pre("save", function (next) {
  if (!this.isNew) throw new Error("Comment cannot be edited");
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
