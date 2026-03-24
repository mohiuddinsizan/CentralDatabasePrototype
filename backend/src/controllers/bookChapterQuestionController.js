import mongoose from "mongoose";
import Book from "../models/Book.js";
import BookChapter from "../models/BookChapter.js";
import Question from "../models/Question.js";
import BookChapterQuestion from "../models/BookChapterQuestion.js";
import BookChapterTopic from "../models/BookChapterTopic.js";
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

const resolveTopic = async (chapter, topicId, adminId) => {
  if (!topicId) {
    return ensureDefaultTopic(chapter, adminId);
  }

  if (topicId === "default") {
    return ensureDefaultTopic(chapter, adminId);
  }

  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    const err = new Error("Valid topicId is required");
    err.statusCode = 400;
    throw err;
  }

  const topic = await BookChapterTopic.findOne({
    _id: topicId,
    bookChapter: chapter._id,
  });

  if (!topic) {
    const err = new Error("Topic not found in this chapter");
    err.statusCode = 404;
    throw err;
  }

  return topic;
};

export const getBookChapterQuestions = asyncHandler(async (req, res) => {
  const { chapterId, topicId } = req.query;

  if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
    res.status(400);
    throw new Error("Valid chapterId is required");
  }

  const chapter = await BookChapter.findById(chapterId);
  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  const topic = await resolveTopic(chapter, topicId, req.admin._id);

  const items = await BookChapterQuestion.find({
    bookChapter: chapterId,
    topic: topic._id,
  })
    .populate({
      path: "topic",
      select: "name isDefault order",
    })
    .populate({
      path: "sourceQuestion",
      populate: [
        { path: "archive", select: "name className" },
        { path: "chapter", select: "name" },
        { path: "createdBy", select: "name username" },
      ],
    })
    .populate("createdBy", "name username")
    .sort({ order: 1, createdAt: 1 });

  res.json(items);
});

export const replaceBookChapterQuestions = asyncHandler(async (req, res) => {
  const { chapterId, topicId, sourceQuestionIds } = req.body;

  if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
    res.status(400);
    throw new Error("Valid chapterId is required");
  }

  if (!Array.isArray(sourceQuestionIds)) {
    res.status(400);
    throw new Error("sourceQuestionIds must be an array");
  }

  const chapter = await BookChapter.findById(chapterId).populate("book");
  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  const book = await Book.findById(chapter.book?._id || chapter.book);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  if (!book.enabledSections.includes("selectedQuestions")) {
    res.status(400);
    throw new Error("selectedQuestions is not enabled for this book");
  }

  const topic = await resolveTopic(chapter, topicId, req.admin._id);

  const validIds = sourceQuestionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  const foundQuestions = await Question.find({ _id: { $in: validIds } }).select(
    "_id title"
  );

  const foundIdSet = new Set(foundQuestions.map((q) => String(q._id)));

  const cleanIds = validIds.filter((id) => foundIdSet.has(String(id)));

  await BookChapterQuestion.deleteMany({
    bookChapter: chapterId,
    topic: topic._id,
    sourceQuestion: { $nin: cleanIds },
  });

  for (let index = 0; index < cleanIds.length; index += 1) {
    const id = cleanIds[index];

    await BookChapterQuestion.findOneAndUpdate(
      {
        bookChapter: chapter._id,
        sourceQuestion: id,
      },
      {
        $set: {
          book: book._id,
          bookChapter: chapter._id,
          topic: topic._id,
          sourceQuestion: id,
          order: index + 1,
          createdBy: req.admin._id,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  const items = await BookChapterQuestion.find({
    bookChapter: chapterId,
    topic: topic._id,
  })
    .populate({
      path: "topic",
      select: "name isDefault order",
    })
    .populate({
      path: "sourceQuestion",
      populate: [
        { path: "archive", select: "name className" },
        { path: "chapter", select: "name" },
        { path: "createdBy", select: "name username" },
      ],
    })
    .populate("createdBy", "name username")
    .sort({ order: 1, createdAt: 1 });

  res.json(items);
});

export const deleteBookChapterQuestion = asyncHandler(async (req, res) => {
  const item = await BookChapterQuestion.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Book chapter question not found");
  }

  await item.deleteOne();
  res.json({ message: "Book chapter question deleted" });
});