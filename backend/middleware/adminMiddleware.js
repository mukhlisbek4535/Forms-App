export const adminOverRide = async (req, res, next) => {
  if (req.user.isAdmin) {
    req.adminBypass = true;
  }
  next();
};

export const verifyOwnership = async (req, res, next) => {
  try {
    const resource = await req.model.findById(req.params.templateId);

    if (!resource)
      return res.status(404).json({ message: "Resource not found." });

    if (req.adminBypass || resource.createdBy.equals(req.user.userId)) {
      req.resource = resource;
      return next();
    }
    return res.status(403).json({ message: "Not authorized." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ownership check failed", error: error.message });
  }
};
