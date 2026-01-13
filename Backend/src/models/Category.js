const mongoose = require("mongoose");
const slugify = require("slugify");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

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
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });
categorySchema.plugin(mongooseLeanVirtuals);

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

categorySchema.virtual("imageUrl").get(function () {
  if (!this.image) return null;

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${this.image}`;
});

// Pre-save: Generate slug
categorySchema.pre("save", async function () {
  if (!this.isModified("name.en")) return;

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
});

// Pre-save: Validate parent is not self
categorySchema.pre("save", async function () {
  if (
    this.parent &&
    this._id &&
    this.parent.toString() === this._id.toString()
  ) {
    throw new Error("Category cannot be its own parent");
  }
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
categorySchema.statics.getCategoryTree = async function ({
  isActive = true,
} = {}) {
  const filter = {
    isActive,
  };

  const categories = await this.find(filter)
    .sort({ order: 1, "name.en": 1 })
    .lean({ virtuals: true });

  const map = {};
  categories.forEach((cat) => {
    cat.subcategories = [];
    map[cat._id.toString()] = cat;
  });

  const tree = [];

  categories.forEach((cat) => {
    if (cat.parent) {
      const parentId = cat.parent.toString();
      if (map[parentId]) {
        map[parentId].subcategories.push(cat);
      }
    } else {
      tree.push(cat);
    }
  });
  const removeId = (node) => {
    delete node.id;
    if (node.subcategories?.length) {
      node.subcategories.forEach(removeId);
    }
  };

  tree.forEach(removeId);

  return tree;
};

categorySchema.statics.getAllDescendantIds = async function (categoryId) {
  const children = await this.find({ parent: categoryId }).select("_id");
  let ids = children.map((child) => child._id);
  for (const child of children) {
    const childIds = await this.getAllDescendantIds(child._id);
    ids = ids.concat(childIds);
  }
  return ids;
};

module.exports = mongoose.model("Category", categorySchema);
