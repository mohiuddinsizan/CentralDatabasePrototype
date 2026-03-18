import Chapter from "../models/Chapter.js";
import Archive from "../models/Archive.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createChapter = asyncHandler(async (req, res) => {
  const { archiveId, name, order } = req.body;

  const archive = await Archive.findById(archiveId);
  if (!archive) {
    res.status(404);
    throw new Error("Archive not found");
  }

  const exists = await Chapter.findOne({ archive: archiveId, name });
  if (exists) {
    res.status(400);
    throw new Error("Chapter already exists in this archive");
  }

  const chapter = await Chapter.create({
    archive: archiveId,
    name,
    order: order || 0,
    createdBy: req.admin._id,
  });

  res.status(201).json(chapter);
});

export const getChapters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.archiveId) filter.archive = req.query.archiveId;

  const chapters = await Chapter.find(filter)
    .populate("archive", "name className")
    .sort({ order: 1, createdAt: 1 });

  res.json(chapters);
});

export const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);

  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }

  chapter.name = req.body.name ?? chapter.name;
  chapter.order = req.body.order ?? chapter.order;

  const updated = await chapter.save();
  res.json(updated);
});

export const deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);

  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }

  await chapter.deleteOne();
  res.json({ message: "Chapter deleted" });
});