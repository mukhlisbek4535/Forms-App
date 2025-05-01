import Tag from "../models/tagModel.js";

// Autocomplete for tags
export const searchTags = async (req, res) => {
  const query = req.query.search;

  if (!query || query.length < 1) return res.json([]);

  try {
    const tags = await Tag.find({
      name: { $regex: `^${query}`, $options: "i" },
    }).limit(10);

    res.json(tags.map((tag) => tag.name));
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch tags", details: err.message });
  }
};

// Helper: Add or increment tags in DB
export const registerTags = async (tags = []) => {
  const operations = tags.map((tagName) => ({
    updateOne: {
      filter: { name: tagName },
      update: { $inc: { usageCount: 1 } },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await Tag.bulkWrite(operations);
  }
};
