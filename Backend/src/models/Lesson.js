const mongoose = require("mongoose");

const filesSchema = new mongoose.Schema(
  {
    name: String,
    type: { type: String, enum: ["pdf", "zip"] },
    fileName: String,
    size: Number,
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

filesSchema.virtual("fileUrl").get(function () {
  if (!this.fileName) return null;
  return `${process.env.BASE_URL}/files/${this.fileName}`;
});

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
        enum: ["cloudinary", "local"],
      },
      fileName: String,
      size: Number,
      duration: Number,
    },

    files: [filesSchema],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

lessonSchema.index({ section: 1, order: 1 });

lessonSchema.virtual("videoUrl").get(function () {
  if (!this.video || !this.video.fileName) return null;
  return `${process.env.BASE_URL}/videos/${this.video.fileName}`;
});

lessonSchema.virtual("quiz", {
  ref: "Quiz",
  localField: "_id",
  foreignField: "lesson",
  justOne: true,
});


module.exports = mongoose.model("Lesson", lessonSchema);
