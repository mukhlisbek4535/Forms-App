import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

likeSchema.index({ template: 1, user: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;
