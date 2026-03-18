import mongoose from "mongoose";
import { FIXED_TAGS } from "../constants/tags.js";

const mcqOptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true }, // ক, খ, গ, ঘ
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const cqPartSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // ক, খ, গ
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    archive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Archive",
      required: true,
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    type: {
      type: String,
      enum: ["MCQ", "CQ"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    hasStem: {
      type: Boolean,
      default: false,
    },

    stem: {
      type: String,
      default: "",
      trim: true,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    tags: [
      {
        type: String,
        enum: FIXED_TAGS,
      },
    ],

    mcqOptions: {
      type: [mcqOptionSchema],
      default: [],
    },

    cqParts: {
      type: [cqPartSchema],
      default: [],
    },

    settingsSnapshot: {
      defaultMcqOptionCount: { type: Number, default: 4 },
      defaultCqPartCount: { type: Number, default: 1 },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

questionSchema.pre("validate", function (next) {
  if (this.type === "MCQ") {
    this.hasStem = false;
    this.stem = "";
    this.cqParts = [];
  }

  if (this.type === "CQ") {
    this.mcqOptions = [];

    if (!this.hasStem) {
      this.stem = "";
    }
  }

  next();
});

const Question = mongoose.model("Question", questionSchema);

export default Question;