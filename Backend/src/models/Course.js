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
    shortDescription: {
      en: {
        type: String,
        maxLength: [200, "Short description cannot exceed 200 characters"],
      },
      ar: {
        type: String,
        maxLength: [200, "وصف الدوره البسيط يجب الا يتعدي ال 200 حرف"],
      },
    },
    description: {
      en: {
        type: String,
        minLength: [50, "Course description must be at least 50 characters"],
        maxLength: [5000, "Course description cannot exceed 1000 characters"],
        required: true,
      },
      ar: {
        type: String,
        minLength: [50, "وصف الدوره يجب الا يكون اقل من 50 حرف"],
        maxLength: [5000, "وصف الدوره يجب الا يتعدي ال 1000 حرف"],
        required: true,
      },
    },
    requirements: {
      en: [
        {
          type: String,
          trim: true,
          default: "No Requirements",
        },
      ],
      ar: [
        {
          type: String,
          trim: true,
          default: "لا يوجد متطلبات سابقه",
        },
      ],
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (v) {
          return !v || v < this.price;
        },
        message: "Discount price must be less than regular price",
      },
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "instructorProfile",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    level: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

courseSchema.virtual("thumbnailUrl").get(function () {
  if (!this.thumbnail) return null;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${this.thumbnail}`;
});

courseSchema.pre("save", function () {
  if (!this.slug) {
    this.slug = slugify(this.title.en, { lower: true });
  }
});

module.exports = mongoose.model("Course", courseSchema);
