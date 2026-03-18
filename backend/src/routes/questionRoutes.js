import express from "express";
import {
  createQuestion,
  deleteQuestion,
  getAvailableTags,
  getQuestionById,
  getQuestions,
  updateQuestion,
} from "../controllers/questionController.js";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/tags", protect, getAvailableTags);

router.route("/").get(protect, getQuestions).post(protect, createQuestion);

router
  .route("/:id")
  .get(protect, validateObjectId("id"), getQuestionById)
  .put(protect, validateObjectId("id"), updateQuestion)
  .delete(protect, validateObjectId("id"), deleteQuestion);

export default router;