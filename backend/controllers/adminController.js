import User from "../models/users.js";

export const updateAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (user._id.equals(req.user.userId))
      return res
        .status(400)
        .json({ message: "You cannot change your own admin status." });

    user.isAdmin = req.body.isAdmin;
    await user.save();

    res.status(200).json({ newAdmin: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Admin promotion failed", error: error.message });
  }
};
