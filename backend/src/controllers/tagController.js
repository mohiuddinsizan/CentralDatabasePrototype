import Tag from "../models/Tag.js";
import slugify from "../utils/slugify.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/tags
 * public/admin-auth depending on your middleware setup
 */
export const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find().sort({ name: 1 });
  res.json(tags);
});

/**
 * POST /api/tags
 * body: { name }
 */
export const createTag = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Tag name is required");
  }

  const cleanName = name.trim();
  const slug = slugify(cleanName);

  const existing = await Tag.findOne({
    $or: [{ name: cleanName }, { slug }],
  });

  if (existing) {
    res.status(400);
    throw new Error("Tag already exists");
  }

  const tag = await Tag.create({
    name: cleanName,
    slug,
  });

  res.status(201).json(tag);
});

/**
 * PUT /api/tags/:id
 * body: { name }
 */
export const updateTag = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Tag name is required");
  }

  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  const cleanName = name.trim();
  const slug = slugify(cleanName);

  const duplicate = await Tag.findOne({
    _id: { $ne: tag._id },
    $or: [{ name: cleanName }, { slug }],
  });

  if (duplicate) {
    res.status(400);
    throw new Error("Another tag with this name already exists");
  }

  tag.name = cleanName;
  tag.slug = slug;

  const updated = await tag.save();
  res.json(updated);
});

/**
 * DELETE /api/tags/:id
 */
export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  await tag.deleteOne();

  res.json({ message: "Tag deleted successfully" });
});