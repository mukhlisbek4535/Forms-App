import Tag from "../models/tagModel.js";
import Template from "../models/templateModel.js";

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
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

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
