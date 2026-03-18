import express from "express";
import {
  createChapter,
  deleteChapter,
  getChapters,
  updateChapter,
} from "../controllers/chapterController.js";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.route("/").get(protect, getChapters).post(protect, createChapter);

router
  .route("/:id")
  .put(protect, validateObjectId("id"), updateChapter)
  .delete(protect, validateObjectId("id"), deleteChapter);

export default router;