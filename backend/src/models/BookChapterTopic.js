import mongoose from "mongoose";

const bookChapterTopicSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

bookChapterTopicSchema.index({ bookChapter: 1, name: 1 }, { unique: true });

bookChapterTopicSchema.index(
  { bookChapter: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
  }
);

const BookChapterTopic = mongoose.model(
  "BookChapterTopic",
  bookChapterTopicSchema
);

export default BookChapterTopic;