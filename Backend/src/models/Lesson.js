const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    title: {
      en: { type: String, required: true },
      ar: { type: String },
    },
    videoUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // seconds
    },
    order: {
      type: Number,
      default: 0,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
