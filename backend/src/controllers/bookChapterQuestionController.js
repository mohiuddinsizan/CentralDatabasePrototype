import mongoose from "mongoose";
import Book from "../models/Book.js";
import BookChapter from "../models/BookChapter.js";
import Question from "../models/Question.js";
import BookChapterQuestion from "../models/BookChapterQuestion.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getBookChapterQuestions = asyncHandler(async (req, res) => {
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

  const items = await BookChapterQuestion.find({ bookChapter: chapterId })
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
  const { chapterId, sourceQuestionIds } = req.body;

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

  const validIds = sourceQuestionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  const foundQuestions = await Question.find({ _id: { $in: validIds } }).select(
    "_id title"
  );

  const foundIdSet = new Set(foundQuestions.map((q) => String(q._id)));

  await BookChapterQuestion.deleteMany({ bookChapter: chapterId });

  const docs = validIds
    .filter((id) => foundIdSet.has(String(id)))
    .map((id, index) => ({
      book: book._id,
      bookChapter: chapter._id,
      sourceQuestion: id,
      order: index + 1,
      createdBy: req.admin._id,
    }));

  if (docs.length > 0) {
    await BookChapterQuestion.insertMany(docs);
  }

  const items = await BookChapterQuestion.find({ bookChapter: chapterId })
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