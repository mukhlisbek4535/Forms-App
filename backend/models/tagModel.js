import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  usageCount: {
    type: Number,
    default: 1,
  },
});

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
