const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    type: { type: String, enum: ["pdf", "zip"] },
    publicId: String,
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

    order: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    video: {
      provider: {
        type: String,
        enum: ["cloudinary", "youtube"],
      },
      publicId: String,
      duration: Number,
    },

    attachments: [attachmentSchema],

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
  },
  { timestamps: true }
);

lessonSchema.index({ section: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
