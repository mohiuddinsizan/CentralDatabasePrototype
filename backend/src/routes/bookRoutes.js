import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  getBookSectionOptions,
  updateBook,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/section-options", protect, getBookSectionOptions);

router.route("/").get(protect, getBooks).post(protect, createBook);

router
  .route("/:id")
  .get(protect, validateObjectId("id"), getBookById)
  .put(protect, validateObjectId("id"), updateBook)
  .delete(protect, validateObjectId("id"), deleteBook);

export default router;