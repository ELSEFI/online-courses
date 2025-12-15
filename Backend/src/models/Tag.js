const mongoose = require("mongoose");
const slugify = require("slugify");

const tagSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String },
    },
    slug: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

tagSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name.en, { lower: true });
  }
  next();
});

module.exports = mongoose.model("Tag", tagSchema);
