import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    archive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Archive",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

chapterSchema.index({ archive: 1, name: 1 }, { unique: true });

const Chapter = mongoose.model("Chapter", chapterSchema);

export default Chapter;