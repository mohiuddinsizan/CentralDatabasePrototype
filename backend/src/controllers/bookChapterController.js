import mongoose from "mongoose";
import Book from "../models/Book.js";
import BookChapter from "../models/BookChapter.js";
import Question from "../models/Question.js";
import asyncHandler from "../utils/asyncHandler.js";

const isEnabled = (book, key) => book.enabledSections.includes(key);

export const createBookChapter = asyncHandler(async (req, res) => {
  const { bookId, title, order } = req.body;

  if (!bookId || !title?.trim()) {
    res.status(400);
    throw new Error("bookId and title are required");
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    res.status(400);
    throw new Error("Invalid bookId");
  }

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const exists = await BookChapter.findOne({
    book: bookId,
    title: title.trim(),
  });

  if (exists) {
    res.status(400);
    throw new Error("Chapter already exists in this book");
  }

  const chapter = await BookChapter.create({
    book: bookId,
    title: title.trim(),
    order: Number(order) || 1,
    createdBy: req.admin._id,
  });

  const populated = await BookChapter.findById(chapter._id)
    .populate("book", "title className subject enabledSections")
    .populate("createdBy", "name username")
    .populate({
      path: "selectedQuestions",
      populate: [
        { path: "archive", select: "name className" },
        { path: "chapter", select: "name" },
        { path: "createdBy", select: "name username" },
      ],
    });

  res.status(201).json(populated);
});

export const getBookChapters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.bookId) filter.book = req.query.bookId;

  const chapters = await BookChapter.find(filter)
    .populate("book", "title className subject enabledSections")
    .populate("createdBy", "name username")
    .populate({
      path: "selectedQuestions",
      populate: [
        { path: "archive", select: "name className" },
        { path: "chapter", select: "name" },
        { path: "createdBy", select: "name username" },
      ],
    })
    .sort({ order: 1, createdAt: 1 });

  res.json(chapters);
});

export const getBookChapterById = asyncHandler(async (req, res) => {
  const chapter = await BookChapter.findById(req.params.id)
    .populate("book", "title className subject enabledSections")
    .populate("createdBy", "name username")
    .populate({
      path: "selectedQuestions",
      populate: [
        { path: "archive", select: "name className" },
        { path: "chapter", select: "name" },
        { path: "createdBy", select: "name username" },
      ],
    });

  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  res.json(chapter);
});

export const updateBookChapter = asyncHandler(async (req, res) => {
  const chapter = await BookChapter.findById(req.params.id);

  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  const book = await Book.findById(chapter.book);
  if (!book) {
    res.status(404);
    throw new Error("Parent book not found");
  }

  const {
    title,
    order,
    boardAnalysis,
    customTables,
    formulas,
    videos,
    figures,
    selectedQuestions,
  } = req.body;

  if (title !== undefined) chapter.title = title.trim();
  if (order !== undefined) chapter.order = Number(order) || chapter.order;

  if (Array.isArray(boardAnalysis)) {
    if (!isEnabled(book, "boardAnalysis")) {
      res.status(400);
      throw new Error("boardAnalysis is not enabled for this book");
    }

    chapter.boardAnalysis = boardAnalysis.map((entry) => ({
      year: Number(entry.year),
      boards: Array.isArray(entry.boards)
        ? entry.boards.map((board) => ({
            boardName: board.boardName?.trim() || "",
            questionCount: Number(board.questionCount) || 0,
          }))
        : [],
    }));
  }

  if (Array.isArray(customTables)) {
    if (!isEnabled(book, "tables")) {
      res.status(400);
      throw new Error("tables is not enabled for this book");
    }

    chapter.customTables = customTables.map((table) => ({
      title: table.title?.trim() || "",
      columns: Array.isArray(table.columns)
        ? table.columns.map((col) => col?.trim() || "")
        : [],
      rows: Array.isArray(table.rows)
        ? table.rows.map((row) => ({
            cells: Array.isArray(row.cells)
              ? row.cells.map((cell) => ({
                  value: cell.value?.trim() || "",
                }))
              : [],
          }))
        : [],
    }));
  }

  if (Array.isArray(formulas)) {
    if (!isEnabled(book, "formulas")) {
      res.status(400);
      throw new Error("formulas is not enabled for this book");
    }

    chapter.formulas = formulas.map((formula) => ({
      title: formula.title?.trim() || "",
      formula: formula.formula?.trim() || "",
      details: formula.details?.trim() || "",
    }));
  }

  if (Array.isArray(videos)) {
    if (!isEnabled(book, "videos")) {
      res.status(400);
      throw new Error("videos is not enabled for this book");
    }

    chapter.videos = videos.map((item) => ({
      title: item.title?.trim() || "",
      url: item.url?.trim() || "",
      description: item.description?.trim() || "",
    }));
  }

  if (Array.isArray(figures)) {
    if (!isEnabled(book, "figures")) {
      res.status(400);
      throw new Error("figures is not enabled for this book");
    }

    chapter.figures = figures.map((item) => ({
      title: item.title?.trim() || "",
      url: item.url?.trim() || "",
      description: item.description?.trim() || "",
    }));
  }

  if (Array.isArray(selectedQuestions)) {
    if (!isEnabled(book, "selectedQuestions")) {
      res.status(400);
      throw new Error("selectedQuestions is not enabled for this book");
    }

    const validIds = selectedQuestions.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const foundQuestions = await Question.find({ _id: { $in: validIds } }).select(
      "_id"
    );

    chapter.selectedQuestions = foundQuestions.map((q) => q._id);
  }

  const updated = await chapter.save();

  const populated = await BookChapter.findById(updated._id)
    .populate("book", "title className subject enabledSections")
    .populate("createdBy", "name username")
    .populate({
      path: "selectedQuestions",
      populate: [
        { path: "archive", select: "name className" },
        { path: "chapter", select: "name" },
        { path: "createdBy", select: "name username" },
      ],
    });

  res.json(populated);
});

export const deleteBookChapter = asyncHandler(async (req, res) => {
  const chapter = await BookChapter.findById(req.params.id);

  if (!chapter) {
    res.status(404);
    throw new Error("Book chapter not found");
  }

  await chapter.deleteOne();
  res.json({ message: "Book chapter deleted" });
});