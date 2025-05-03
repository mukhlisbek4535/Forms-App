import Tag from "../models/tagModel.js";
import Template from "../models/templateModel.js";

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

export const getPopularTags = async (req, res) => {
  try {
    const tagCounts = await Template.aggregate([
      { $unwind: "$tags" }, // 👈 Flatten tags array
      { $group: { _id: "$tags", count: { $sum: 1 } } }, // 👈 Group by tag name
      { $sort: { count: -1 } }, // 👈 Descending sort by usage
      { $limit: 20 }, // 👈 Top 20 tags (can tweak)
    ]);

    // Format the response
    const popularTags = tagCounts.map((t) => ({
      tag: t._id,
      count: t.count,
    }));

    res.status(200).json({ tags: popularTags });
  } catch (err) {
    console.error("Failed to fetch popular tags", err);
    res.status(500).json({ error: "Could not fetch popular tags" });
  }
};
