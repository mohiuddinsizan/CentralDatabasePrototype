import mongoose from "mongoose";

const bookChapterQuestionSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    bookChapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookChapter",
      required: true,
    },
    sourceQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

bookChapterQuestionSchema.index(
  { bookChapter: 1, sourceQuestion: 1 },
  { unique: true }
);

const BookChapterQuestion = mongoose.model(
  "BookChapterQuestion",
  bookChapterQuestionSchema
);

export default BookChapterQuestion;