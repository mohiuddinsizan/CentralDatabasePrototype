import Archive from "../models/Archive.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createArchive = asyncHandler(async (req, res) => {
  const { name, className, description } = req.body;

  const exists = await Archive.findOne({ name, className });
  if (exists) {
    res.status(400);
    throw new Error("Archive already exists for this class");
  }

  const archive = await Archive.create({
    name,
    className,
    description,
    createdBy: req.admin._id,
  });

  res.status(201).json(archive);
});

export const getArchives = asyncHandler(async (req, res) => {
  const archives = await Archive.find()
    .populate("createdBy", "name username")
    .sort({ createdAt: -1 });

  res.json(archives);
});

export const getArchiveById = asyncHandler(async (req, res) => {
  const archive = await Archive.findById(req.params.id).populate(
    "createdBy",
    "name username"
  );

  if (!archive) {
    res.status(404);
    throw new Error("Archive not found");
  }

  res.json(archive);
});

export const updateArchive = asyncHandler(async (req, res) => {
  const archive = await Archive.findById(req.params.id);

  if (!archive) {
    res.status(404);
    throw new Error("Archive not found");
  }

  archive.name = req.body.name ?? archive.name;
  archive.className = req.body.className ?? archive.className;
  archive.description = req.body.description ?? archive.description;

  const updated = await archive.save();
  res.json(updated);
});

export const deleteArchive = asyncHandler(async (req, res) => {
  const archive = await Archive.findById(req.params.id);

  if (!archive) {
    res.status(404);
    throw new Error("Archive not found");
  }

  await archive.deleteOne();
  res.json({ message: "Archive deleted" });
});