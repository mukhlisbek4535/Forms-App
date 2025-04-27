import User from "../models/users.js";

const validFields = ["language", "theme"];

export const updatePreferences = async (req, res) => {
  try {
    const updates = Object.keys(req.body)
      .filter((key) => validFields.includes(key))
      .reduce((obj, key) => {
        obj[`preferences.${key}`] = req.body[key];
        return obj;
      }, {});

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "No valid fields to update!" });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: updates,
      },
      { new: true, runValidators: true }
    ).select("preferences");

    res.status(200).json(user.preferences);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Invalid preference update", details: error.message });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("preferences")
      .lean();

    res.status(200).json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the preferences" });
  }
};
