const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    price: {
      type: Number,
      default: 0,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "instructorProfile",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    level: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    thumbnail: String,
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

courseSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title.en, { lower: true });
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
