import Book, { BOOK_SECTION_KEYS } from "../models/Book.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createBook = asyncHandler(async (req, res) => {
  const { title, className, subject, description, enabledSections } = req.body;

  if (!title?.trim() || !className?.trim()) {
    res.status(400);
    throw new Error("title and className are required");
  }

  const safeSections = Array.isArray(enabledSections)
    ? enabledSections.filter((key) => BOOK_SECTION_KEYS.includes(key))
    : [];

  const exists = await Book.findOne({
    title: title.trim(),
    className: className.trim(),
  });

  if (exists) {
    res.status(400);
    throw new Error("Book already exists for this class");
  }

  const book = await Book.create({
    title: title.trim(),
    className: className.trim(),
    subject: subject?.trim() || "",
    description: description?.trim() || "",
    enabledSections: safeSections,
    createdBy: req.admin._id,
  });

  const populated = await Book.findById(book._id).populate(
    "createdBy",
    "name username"
  );

  res.status(201).json(populated);
});

export const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find()
    .populate("createdBy", "name username")
    .sort({ createdAt: -1 });

  res.json(books);
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate(
    "createdBy",
    "name username"
  );

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.json(book);
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const { title, className, subject, description, enabledSections } = req.body;

  if (title !== undefined) book.title = title.trim();
  if (className !== undefined) book.className = className.trim();
  if (subject !== undefined) book.subject = subject.trim();
  if (description !== undefined) book.description = description.trim();

  if (Array.isArray(enabledSections)) {
    book.enabledSections = enabledSections.filter((key) =>
      BOOK_SECTION_KEYS.includes(key)
    );
  }

  const updated = await book.save();

  const populated = await Book.findById(updated._id).populate(
    "createdBy",
    "name username"
  );

  res.json(populated);
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  await book.deleteOne();
  res.json({ message: "Book deleted" });
});

export const getBookSectionOptions = asyncHandler(async (req, res) => {
  res.json(BOOK_SECTION_KEYS);
});