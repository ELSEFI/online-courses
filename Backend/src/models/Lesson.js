const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"],
    },
    title: {
      en: {
        type: String,
        required: [true, "English title is required"],
        trim: true,
        minLength: [3, "Title must be at least 3 characters"],
        maxLength: [100, "Title cannot exceed 100 characters"],
      },
      ar: {
        type: String,
        required: [true, "اسم العنوان بالعربي مطلوب"],
        trim: true,
        minLength: [3, "Title must be at least 3 characters"],
        maxLength: [100, "Title cannot exceed 100 characters"],
      },
    },
    description: {
      en: {
        type: String,
        maxLength: [1000, "Description cannot exceed 1000 characters"],
      },
      ar: {
        type: String,
        maxLength: [1000, "الوصف لا يمكن ان يكون اقل من 1000 حرف"],
      },
    },

    contentType: {
      type: String,
      enum: {
        values: ["video", "pdf", "quiz", "assignment"],
        message: "Invalid content type",
      },
      required: [true, "Content type is required"],
    },

    video: {
      url: {
        type: String,
        required: function () {
          return this.contentType === "video";
        },
      },
      duration: {
        type: Number,
      },
      thumbnail: String,
    },

    pdf: {
      url: {
        type: String,
        required: function () {
          return this.contentType === "pdf";
        },
      },
      fileName: String,
      fileSize: Number, //bytes
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: {
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

    attachments: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          enum: ["pdf", "doc", "docx", "zip", "other"],
        },
        fileSize: Number,
      },
    ],

    viewsCount: {
      type: Number,
      default: 0,
    },
    completionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ========== Indexes ==========
contentSchema.index({ course: 1, section: 1, order: 1 });
contentSchema.index({ section: 1, contentType: 1 });
contentSchema.index({ isFreePreview: 1, isActive: 1 });

// ========== Methods ==========
contentSchema.methods.incrementViews = async function () {
  this.viewsCount += 1;
  await this.save();
};

module.exports = mongoose.model("Content", contentSchema);
