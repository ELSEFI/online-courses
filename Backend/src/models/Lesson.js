const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["pdf", "zip"],
      required: true,
    },
    fileUrl: { type: String, required: true },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },

    type: {
      type: String,
      enum: ["video", "quiz", "file"],
      default: "video",
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🎥 Video metadata
    video: {
      provider: {
        type: String,
        enum: ["cloudinary"],
      },
      publicId: String,
      duration: Number, // seconds
    },

    // 📎 Attachments
    files: [attachmentSchema],

    // 📝 Quiz reference (optional)
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
  },
  { timestamps: true }
);

lessonSchema.index({ section: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
