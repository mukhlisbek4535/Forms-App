import jwt from "jsonwebtoken";
import User from "../models/users.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  console.log("Hey, It is working");
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      lastLogin: new Date(),
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Successfully registered",
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        status: savedUser.status,
        token,
      },
    });
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.email) {
      return res.status(400).json({
        error: "Email already registered (duplicate index error)",
      });
    }

    res.status(500).json({
      error: "Registration failed",
      details: e.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.status === "blocked")
      return res.status(403).json({ error: "Account is blocked!" });

    if (user.isDeleted)
      return res.status(403).json({ error: "User is deleted" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid Password" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed.", details: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).sort({ lastLogin: -1 });
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch Users", details: err.message });
  }
};

export const blockUsers = async (req, res) => {
  const { userIds } = req.body;
  console.log("user ids: ", userIds);
  const userIdFromToken = req.user.userId;

  try {
    await User.updateMany(
      { _id: { $in: userIds }, isDeleted: false },
      { $set: { status: "blocked" } }
    );

    const loggedInUser = userIds.includes(userIdFromToken);

    if (loggedInUser) {
      return res.status(200).json({ message: "You have blocked yourself" });
    }

    res.status(200).json({ message: "You have successfully blocked User(s)" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to block the users", details: err.message });
  }
};

export const unBlockUsers = async (req, res) => {
  const { userIds } = req.body;

  try {
    await User.updateMany(
      { _id: { $in: userIds }, isDeleted: false },
      { $set: { status: "active" } }
    );

    res.status(200).json({ message: "Users successfully unblocked" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Could not unblock users", details: err.message });
  }
};

export const deleteUsers = async (req, res) => {
  const { userIds } = req.body;
  const userIdFromToken = req.user.userId;

  const loggedInUser = userIds.includes(userIdFromToken);

  try {
    await User.deleteMany({ _id: { $in: userIds } });

    if (loggedInUser) {
      return res.status(200).json({ message: "You have deleted yourself" });
    }

    res.status(200).json({ message: "User(s) successfully deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete users", details: err.message });
  }
};

export const updateUserRoles = async (req, res) => {
  const { userIds, makeAdmin } = req.body;

  if (!Array.isArray(userIds) || typeof makeAdmin !== "boolean") {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  try {
    const updated = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isAdmin: makeAdmin } }
    );

    const selfAffected = userIds.includes(req.user.userId);

    let message = `Updated roles for ${updated.modifiedCount} user(s).`;
    if (selfAffected) {
      message += " You have updated your own admin status.";
    }

    res.status(200).json({ message });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update user roles", details: err.message });
  }
};
