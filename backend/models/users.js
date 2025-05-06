import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },
  lastLogin: {
    type: Date,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  preferences: {
    language: {
      type: String,
      enum: ["en", "es"],
      default: "en",
      required: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
      required: true,
    },
  },
});

userSchema.index({ "preferences.language": 1, "preferences.theme": 1 });

const User = mongoose.model("User", userSchema);
export default User;
