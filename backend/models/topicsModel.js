import mongoose from "mongoose";
import slugify from "slugify"; // Helpful for SEO-friendly slugs like "education"

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
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Pre-save hook to auto-generate slug from name
topicSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
