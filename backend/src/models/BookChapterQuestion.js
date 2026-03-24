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
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookChapterTopic",
      default: null,
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

bookChapterQuestionSchema.index({ bookChapter: 1, topic: 1, order: 1 });

const BookChapterQuestion = mongoose.model(
  "BookChapterQuestion",
  bookChapterQuestionSchema
);

export default BookChapterQuestion;