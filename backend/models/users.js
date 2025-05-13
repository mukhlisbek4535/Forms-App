import mongoose from "mongoose";
import crypto from "crypto";

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
  apiToken: {
    type: String,
    unique: true,
    sparse: true,
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

userSchema.pre("save", function (next) {
  if (!this.apiToken) {
    this.apiToken = crypto.randomBytes(24).toString("hex");
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
