import mongoose from "mongoose";
import BookChapter from "../models/BookChapter.js";
import BookChapterTopic from "../models/BookChapterTopic.js";
import BookChapterQuestion from "../models/BookChapterQuestion.js";
import asyncHandler from "../utils/asyncHandler.js";

const ensureDefaultTopic = async (bookChapter, adminId) => {
  let defaultTopic = await BookChapterTopic.findOne({
    bookChapter: bookChapter._id,
    isDefault: true,
  });

  if (!defaultTopic) {
    defaultTopic = await BookChapterTopic.create({
      book: bookChapter.book,
      bookChapter: bookChapter._id,
      name: "Default",
      order: 0,
      isDefault: true,
      createdBy: adminId,
    });
  }

  return defaultTopic;
};

export const getBookChapterTopics = asyncHandler(async (req, res) => {
  const { chapterId } = req.query;

  if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
    res.status(400);
    throw new Error("Valid chapterId is required");
  }

  const chapter = await BookChapter.findById(chapterId);
  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  await ensureDefaultTopic(chapter, req.admin._id);

  const topics = await BookChapterTopic.find({ bookChapter: chapterId })
    .sort({ isDefault: -1, order: 1, createdAt: 1 })
    .populate("createdBy", "name username")
    .lean();

  const counts = await BookChapterQuestion.aggregate([
    {
      $match: {
        bookChapter: chapter._id,
      },
    },
    {
      $group: {
        _id: "$topic",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    counts.map((item) => [String(item._id), item.count])
  );

  const result = topics.map((topic) => ({
    ...topic,
    questionCount: countMap.get(String(topic._id)) || 0,
  }));

  res.json(result);
});

export const createBookChapterTopic = asyncHandler(async (req, res) => {
  const { chapterId, name, order } = req.body;

  if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
    res.status(400);
    throw new Error("Valid chapterId is required");
  }

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Topic name is required");
  }

  const chapter = await BookChapter.findById(chapterId);
  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  await ensureDefaultTopic(chapter, req.admin._id);

  const exists = await BookChapterTopic.findOne({
    bookChapter: chapter._id,
    name: name.trim(),
  });

  if (exists) {
    res.status(400);
    throw new Error("Topic already exists in this chapter");
  }

  const topic = await BookChapterTopic.create({
    book: chapter.book,
    bookChapter: chapter._id,
    name: name.trim(),
    order: order || 0,
    isDefault: false,
    createdBy: req.admin._id,
  });

  const populated = await BookChapterTopic.findById(topic._id).populate(
    "createdBy",
    "name username"
  );

  res.status(201).json(populated);
});

export const updateBookChapterTopic = asyncHandler(async (req, res) => {
  const topic = await BookChapterTopic.findById(req.params.id);

  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }

  const { name, order } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      res.status(400);
      throw new Error("Topic name is required");
    }

    if (topic.isDefault && name.trim() !== "Default") {
      res.status(400);
      throw new Error("Default topic name cannot be changed");
    }

    const exists = await BookChapterTopic.findOne({
      bookChapter: topic.bookChapter,
      name: name.trim(),
      _id: { $ne: topic._id },
    });

    if (exists) {
      res.status(400);
      throw new Error("Topic already exists in this chapter");
    }

    topic.name = name.trim();
  }

  if (order !== undefined) {
    topic.order = order;
  }

  const updated = await topic.save();
  const populated = await BookChapterTopic.findById(updated._id).populate(
    "createdBy",
    "name username"
  );

  res.json(populated);
});

export const deleteBookChapterTopic = asyncHandler(async (req, res) => {
  const topic = await BookChapterTopic.findById(req.params.id);

  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }

  if (topic.isDefault) {
    res.status(400);
    throw new Error("Default topic cannot be deleted");
  }

  const chapter = await BookChapter.findById(topic.bookChapter);
  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  const defaultTopic = await ensureDefaultTopic(chapter, req.admin._id);

  await BookChapterQuestion.updateMany(
    { bookChapter: chapter._id, topic: topic._id },
    { $set: { topic: defaultTopic._id } }
  );

  await topic.deleteOne();

  res.json({ message: "Topic deleted" });
});