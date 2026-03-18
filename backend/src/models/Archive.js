import mongoose from "mongoose";

const archiveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

archiveSchema.index({ name: 1, className: 1 }, { unique: true });

const Archive = mongoose.model("Archive", archiveSchema);

export default Archive;