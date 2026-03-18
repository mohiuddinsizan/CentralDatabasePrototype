import mongoose from "mongoose";

const ALLOWED_BOOK_SECTIONS = [
  "boardAnalysis",
  "tables",
  "formulas",
  "videos",
  "figures",
  "selectedQuestions",
];

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    enabledSections: [
      {
        type: String,
        enum: ALLOWED_BOOK_SECTIONS,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

bookSchema.index({ title: 1, className: 1 }, { unique: true });

export const BOOK_SECTION_KEYS = ALLOWED_BOOK_SECTIONS;

const Book = mongoose.model("Book", bookSchema);

export default Book;