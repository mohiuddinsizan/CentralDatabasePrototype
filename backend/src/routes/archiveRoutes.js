import express from "express";
import {
  createArchive,
  deleteArchive,
  getArchiveById,
  getArchives,
  updateArchive,
} from "../controllers/archiveController.js";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.route("/").get(protect, getArchives).post(protect, createArchive);

router
  .route("/:id")
  .get(protect, validateObjectId("id"), getArchiveById)
  .put(protect, validateObjectId("id"), updateArchive)
  .delete(protect, validateObjectId("id"), deleteArchive);

export default router;