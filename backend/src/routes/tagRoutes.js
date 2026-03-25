import express from "express";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";

const router = express.Router();

// if you have admin auth middleware, add it here
// example:
// import { protect, adminOnly } from "../middleware/authMiddleware.js";
// router.route("/").get(protect, adminOnly, getTags).post(protect, adminOnly, createTag);

router.route("/").get(getTags).post(createTag);
router.route("/:id").put(updateTag).delete(deleteTag);

export default router;