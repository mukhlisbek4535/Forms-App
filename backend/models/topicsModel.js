import mongoose from "mongoose";
import slugify from "slugify";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Topic name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

topicSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
