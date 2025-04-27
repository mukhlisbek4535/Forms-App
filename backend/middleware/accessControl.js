import Response from "../models/responseModel.js";

export const responseAccess = async (req, res, next) => {
  try {
    const response = await Response.findById(req.params.templateId).populate(
      "templateId",
      "createdBy"
    );

    // Admin access
    if (req.user.isAdmin) return next();

    // Response owner
    if (response.userId?.equals(req.user.userId)) return next();

    // Template owner
    if (response.templateId.createdBy.equals(req.user.userId)) return next();

    res.status(403).json({ error: "Access denied" });
  } catch (error) {
    res.status(500).json({ error: "Access check failed" });
  }
};
