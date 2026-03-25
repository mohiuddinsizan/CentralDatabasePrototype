import mongoose from "mongoose";
import Question from "../models/Question.js";
import Archive from "../models/Archive.js";
import Chapter from "../models/Chapter.js";
import Tag from "../models/Tag.js";
import asyncHandler from "../utils/asyncHandler.js";

const BANGLA_MCQ_KEYS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"];
const BANGLA_CQ_LABELS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"];

const normalizeMcqOptions = (mcqOptions = []) =>
  mcqOptions.map((opt, index) => ({
    key: opt?.key?.trim() || BANGLA_MCQ_KEYS[index] || `${index + 1}`,
    text: opt?.text?.trim() || "",
    isCorrect: !!opt?.isCorrect,
  }));

const normalizeCqParts = (cqParts = []) =>
  cqParts.map((part, index) => ({
    label: part?.label?.trim() || BANGLA_CQ_LABELS[index] || `${index + 1}`,
    question: part?.question?.trim() || "",
    answer: part?.answer?.trim() || "",
  }));

const validateArchiveAndChapter = async (archiveId, chapterId) => {
  if (
    !mongoose.Types.ObjectId.isValid(archiveId) ||
    !mongoose.Types.ObjectId.isValid(chapterId)
  ) {
    const error = new Error("Invalid archiveId or chapterId");
    error.statusCode = 400;
    throw error;
  }

  const archive = await Archive.findById(archiveId);
  if (!archive) {
    const error = new Error("Archive not found");
    error.statusCode = 404;
    throw error;
  }

  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    const error = new Error("Chapter not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(chapter.archive) !== String(archiveId)) {
    const error = new Error("Selected chapter does not belong to selected archive");
    error.statusCode = 400;
    throw error;
  }
};

const getAllowedTagNames = async () => {
  const tagDocs = await Tag.find({}, "name").sort({ name: 1 });
  return tagDocs.map((tag) => tag.name);
};

export const createQuestion = asyncHandler(async (req, res) => {
  const {
    archiveId,
    chapterId,
    type,
    title,
    hasStem,
    stem,
    explanation,
    tags,
    mcqOptions,
    cqParts,
    settingsSnapshot,
  } = req.body;

  if (!archiveId || !chapterId || !type || !title?.trim()) {
    res.status(400);
    throw new Error("archiveId, chapterId, type and title are required");
  }

  if (!["MCQ", "CQ"].includes(type)) {
    res.status(400);
    throw new Error("Invalid question type");
  }

  await validateArchiveAndChapter(archiveId, chapterId);

  const allowedTagNames = await getAllowedTagNames();
  const safeTags = Array.isArray(tags)
    ? tags.filter((tag) => allowedTagNames.includes(tag))
    : [];

  let finalMcqOptions = [];
  let finalCqParts = [];
  let finalHasStem = false;
  let finalStem = "";

  if (type === "MCQ") {
    if (!Array.isArray(mcqOptions) || mcqOptions.length < 2) {
      res.status(400);
      throw new Error("MCQ must have at least 2 options");
    }

    finalMcqOptions = normalizeMcqOptions(mcqOptions);

    if (finalMcqOptions.some((opt) => !opt.text)) {
      res.status(400);
      throw new Error("All MCQ options must have text");
    }

    const correctCount = finalMcqOptions.filter((opt) => opt.isCorrect).length;
    if (correctCount < 1) {
      res.status(400);
      throw new Error("At least one correct MCQ option is required");
    }
  }

  if (type === "CQ") {
    if (!Array.isArray(cqParts) || cqParts.length < 1) {
      res.status(400);
      throw new Error("CQ must have at least 1 part");
    }

    finalCqParts = normalizeCqParts(cqParts);

    if (finalCqParts.some((part) => !part.question)) {
      res.status(400);
      throw new Error("Each CQ part must have a question");
    }

    finalHasStem = !!hasStem;
    finalStem = finalHasStem ? stem?.trim() || "" : "";

    if (finalHasStem && !finalStem) {
      res.status(400);
      throw new Error("Stem is required when hasStem is true");
    }
  }

  const question = await Question.create({
    archive: archiveId,
    chapter: chapterId,
    type,
    title: title.trim(),
    hasStem: finalHasStem,
    stem: finalStem,
    explanation: explanation?.trim() || "",
    tags: safeTags,
    mcqOptions: finalMcqOptions,
    cqParts: finalCqParts,
    settingsSnapshot: {
      defaultMcqOptionCount: settingsSnapshot?.defaultMcqOptionCount || 4,
      defaultCqPartCount: settingsSnapshot?.defaultCqPartCount || 1,
    },
    createdBy: req.admin?._id,
  });

  const populated = await Question.findById(question._id)
    .populate("archive", "name className")
    .populate("chapter", "name")
    .populate("createdBy", "name username");

  res.status(201).json(populated);
});

export const getQuestions = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.archiveId) filter.archive = req.query.archiveId;
  if (req.query.chapterId) filter.chapter = req.query.chapterId;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.tag) filter.tags = req.query.tag;

  const questions = await Question.find(filter)
    .populate("archive", "name className")
    .populate("chapter", "name")
    .populate("createdBy", "name username")
    .sort({ createdAt: -1 });

  res.json(questions);
});

export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate("archive", "name className")
    .populate("chapter", "name")
    .populate("createdBy", "name username");

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.json(question);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  const {
    archiveId,
    chapterId,
    title,
    stem,
    hasStem,
    explanation,
    tags,
    mcqOptions,
    cqParts,
    settingsSnapshot,
    type,
  } = req.body;

  const nextArchiveId = archiveId || String(question.archive);
  const nextChapterId = chapterId || String(question.chapter);
  const nextType = type || question.type;

  if (type && !["MCQ", "CQ"].includes(type)) {
    res.status(400);
    throw new Error("Invalid question type");
  }

  await validateArchiveAndChapter(nextArchiveId, nextChapterId);

  question.archive = nextArchiveId;
  question.chapter = nextChapterId;
  question.type = nextType;

  if (title !== undefined) {
    if (!title.trim()) {
      res.status(400);
      throw new Error("Title cannot be empty");
    }
    question.title = title.trim();
  }

  if (explanation !== undefined) {
    question.explanation = explanation.trim();
  }

  if (Array.isArray(tags)) {
    const allowedTagNames = await getAllowedTagNames();
    question.tags = tags.filter((tag) => allowedTagNames.includes(tag));
  }

  if (nextType === "MCQ") {
    const nextMcqOptions = Array.isArray(mcqOptions)
      ? normalizeMcqOptions(mcqOptions)
      : normalizeMcqOptions(question.mcqOptions);

    if (nextMcqOptions.length < 2) {
      res.status(400);
      throw new Error("MCQ must have at least 2 options");
    }

    if (nextMcqOptions.some((opt) => !opt.text)) {
      res.status(400);
      throw new Error("All MCQ options must have text");
    }

    const correctCount = nextMcqOptions.filter((opt) => opt.isCorrect).length;
    if (correctCount < 1) {
      res.status(400);
      throw new Error("At least one correct MCQ option is required");
    }

    question.mcqOptions = nextMcqOptions;
    question.cqParts = [];
    question.hasStem = false;
    question.stem = "";
  }

  if (nextType === "CQ") {
    const nextCqParts = Array.isArray(cqParts)
      ? normalizeCqParts(cqParts)
      : normalizeCqParts(question.cqParts);

    if (nextCqParts.length < 1) {
      res.status(400);
      throw new Error("CQ must have at least 1 part");
    }

    if (nextCqParts.some((part) => !part.question)) {
      res.status(400);
      throw new Error("Each CQ part must have a question");
    }

    const resolvedHasStem =
      hasStem !== undefined ? !!hasStem : !!question.hasStem;

    const resolvedStem =
      resolvedHasStem
        ? stem !== undefined
          ? stem.trim()
          : question.stem?.trim() || ""
        : "";

    if (resolvedHasStem && !resolvedStem) {
      res.status(400);
      throw new Error("Stem is required when hasStem is true");
    }

    question.cqParts = nextCqParts;
    question.mcqOptions = [];
    question.hasStem = resolvedHasStem;
    question.stem = resolvedStem;
  }

  if (settingsSnapshot) {
    question.settingsSnapshot = {
      defaultMcqOptionCount:
        settingsSnapshot.defaultMcqOptionCount ||
        question.settingsSnapshot?.defaultMcqOptionCount ||
        4,
      defaultCqPartCount:
        settingsSnapshot.defaultCqPartCount ||
        question.settingsSnapshot?.defaultCqPartCount ||
        1,
    };
  }

  const updated = await question.save();

  const populated = await Question.findById(updated._id)
    .populate("archive", "name className")
    .populate("chapter", "name")
    .populate("createdBy", "name username");

  res.json(populated);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  await question.deleteOne();
  res.json({ message: "Question deleted" });
});

export const getAvailableTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find().sort({ name: 1 });
  res.json(tags.map((tag) => tag.name));
});