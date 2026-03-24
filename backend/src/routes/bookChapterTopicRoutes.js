import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  createBookChapterTopic,
  deleteBookChapterTopic,
  getBookChapterTopics,
  updateBookChapterTopic,
} from "../controllers/bookChapterTopicController.js";

const router = express.Router();

router.route("/").get(protect, getBookChapterTopics).post(protect, createBookChapterTopic);

router
  .route("/:id")
  .put(protect, validateObjectId("id"), updateBookChapterTopic)
  .delete(protect, validateObjectId("id"), deleteBookChapterTopic);

export default router;