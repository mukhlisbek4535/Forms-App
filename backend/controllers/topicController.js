import Topic from "../models/topicsModel.js";

// Create a new topic
export const createTopic = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if topic already exists
    const existing = await Topic.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Topic already exists" });
    }

    const topic = new Topic({ name, description });
    await topic.save();

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ error: "Server error during topic creation" });
  }
};

// Get all topics
export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 });
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching topics" });
  }
};

// Get a single topic by slug
export const getTopicBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const topic = await Topic.findOne({ slug });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching topic" });
  }
};

// Update a topic
export const updateTopic = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, description } = req.body;

    const topic = await Topic.findOne({ slug });
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    if (name) topic.name = name;
    if (description) topic.description = description;
    await topic.save(); // triggers pre-save hook to regenerate slug

    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: "Server error updating topic" });
  }
};

// Delete a topic
export const deleteTopic = async (req, res) => {
  try {
    const { slug } = req.params;
    const deleted = await Topic.findOneAndDelete({ slug });

    if (!deleted) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.status(200).json({ message: "Topic deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting topic" });
  }
};
