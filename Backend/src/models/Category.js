const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, "English category name is required"],
        trim: true,
        minLength: [2, "Category name must be at least 2 characters"],
        maxLength: [50, "Category name cannot exceed 50 characters"],
      },
      ar: {
        type: String,
        required: [true, "اسم القسم باللغه العربيه مطلوب"],
        trim: true,
        minLength: [2, "اسم القسم يجب ان يكون اكبر من حرفين"],
        maxLength: [50, "اسم القسم يجب الا يتعدي 50 حرف"],
      },
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      en: {
        type: String,
        required: [true, "English category description is required"],
        maxLength: [500, "Description cannot exceed 500 characters"],
      },
      ar: {
        type: String,
        required: [true, "وصف القسم باللغه العربيه مطلوب"],
        maxLength: [500, "يجب الا يتعدي الوصف 500 حرف"],
      },
    },
    image: { type: String },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    coursesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
categorySchema.index({ isActive: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ slug: 1, parent: 1 }, { unique: true });
categorySchema.index({ "name.en": 1, parent: 1 }, { unique: true });

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for courses
categorySchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "category",
});

// Pre-save: Generate slug
categorySchema.pre("save", async function (next) {
  if (!this.isModified("name.en")) return next();

  const Category = mongoose.model("Category");

  const baseSlug = slugify(this.name.en, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (
    await Category.exists({
      slug,
      parent: this.parent || null,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

// Pre-save: Validate parent is not self
categorySchema.pre("save", function (next) {
  if (this.parent && this.parent.toString() === this._id.toString()) {
    return next(new Error("Category cannot be its own parent"));
  }
  next();
});

// Method: Update courses count
categorySchema.methods.updateCoursesCount = async function () {
  const Course = mongoose.model("Course");
  this.coursesCount = await Course.countDocuments({
    category: this._id,
    isPublished: true,
  });
  await this.save();
};

// Static: Get category tree
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true })
    .populate("subcategories")
    .sort({ order: 1, "name.en": 1 });

  return categories.filter((cat) => !cat.parent);
};

module.exports = mongoose.model("Category", categorySchema);
