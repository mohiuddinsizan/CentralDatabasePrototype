import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  createBookChapter,
  deleteBookChapter,
  getBookChapterById,
  getBookChapters,
  updateBookChapter,
} from "../controllers/bookChapterController.js";

const router = express.Router();

router.route("/").get(protect, getBookChapters).post(protect, createBookChapter);

router
  .route("/:id")
  .get(protect, validateObjectId("id"), getBookChapterById)
  .put(protect, validateObjectId("id"), updateBookChapter)
  .delete(protect, validateObjectId("id"), deleteBookChapter);

export default router;