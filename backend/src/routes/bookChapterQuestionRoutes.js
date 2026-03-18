import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  deleteBookChapterQuestion,
  getBookChapterQuestions,
  replaceBookChapterQuestions,
} from "../controllers/bookChapterQuestionController.js";

const router = express.Router();

router.get("/", protect, getBookChapterQuestions);
router.post("/replace", protect, replaceBookChapterQuestions);
router.delete("/:id", protect, validateObjectId("id"), deleteBookChapterQuestion);

export default router;