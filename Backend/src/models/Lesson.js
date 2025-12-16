const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"],
    },
    title: {
      en: {
        type: String,
        required: [true, "English lesson title is required"],
        trim: true,
        minLength: [3, "Lesson title must be at least 3 characters"],
        maxLength: [100, "Lesson title cannot exceed 100 characters"],
      },
      ar: {
        type: String,
        required: [true, "عنوان الدرس باللغه العربيه مطلوب"],
        trim: true,
        minLength: [3, "عنوان الدرس يجب ان يكون علي الاقل 3 حروف"],
        maxLength: [100, "عنوان الدرس يجب الا يتعدي 100 حرف"],
      },
    },
    description: {
      en: {
        type: String,
        maxLength: [1000, "Description cannot exceed 1000 characters"],
      },
      ar: {
        type: String,
        maxLength: [1000, "وصف الدرس يجب الا يتعدي 1000 حرف"],
      },
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    duration: {
      type: Number, // Duration in seconds
      required: [true, "Video duration is required"],
      min: [0, "Duration cannot be negative"],
    },
    order: {
      type: Number,
      default: 0,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: {
          type: String,
        },
        fileUrl: {
          type: String,
        },
        fileSize: {
          type: Number,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ course: 1, section: 1, order: 1 });
lessonSchema.index({ section: 1, order: 1 });
lessonSchema.index({ isFreePreview: 1, isActive: 1 });

// Method: Increment views
lessonSchema.methods.incrementViews = async function () {
  this.viewsCount += 1;
  await this.save();
};

module.exports = mongoose.model("Lesson", lessonSchema);
