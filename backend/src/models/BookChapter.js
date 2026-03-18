import mongoose from "mongoose";

const boardEntrySchema = new mongoose.Schema(
  {
    boardName: {
      type: String,
      required: true,
      trim: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const boardAnalysisYearSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    boards: {
      type: [boardEntrySchema],
      default: [],
    },
  },
  { _id: false }
);

const tableCellSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const tableRowSchema = new mongoose.Schema(
  {
    cells: {
      type: [tableCellSchema],
      default: [],
    },
  },
  { _id: false }
);

const customTableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    columns: {
      type: [String],
      default: [],
    },
    rows: {
      type: [tableRowSchema],
      default: [],
    },
  },
  { _id: false }
);

const formulaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    formula: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const mediaItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const bookChapterSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
    },

    boardAnalysis: {
      type: [boardAnalysisYearSchema],
      default: [],
    },

    customTables: {
      type: [customTableSchema],
      default: [],
    },

    formulas: {
      type: [formulaSchema],
      default: [],
    },

    videos: {
      type: [mediaItemSchema],
      default: [],
    },

    figures: {
      type: [mediaItemSchema],
      default: [],
    },

    selectedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
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

bookChapterSchema.index({ book: 1, title: 1 }, { unique: true });

const BookChapter = mongoose.model("BookChapter", bookChapterSchema);

export default BookChapter;