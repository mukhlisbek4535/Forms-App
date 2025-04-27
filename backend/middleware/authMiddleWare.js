import jwt from "jsonwebtoken";
import User from "../models/users.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.isDeleted) {
      return res.status(401).json({ error: "User not found or deleted" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ error: "User is blocked" });
    }

    req.user = {
      name: user.name,
      userId: decoded.userId,
      isAdmin: user.isAdmin,
    };
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
