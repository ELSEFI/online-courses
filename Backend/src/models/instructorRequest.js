const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinaryConfig");
const instructorRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    jobTitle: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    cvFile: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      en: String,
      ar: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual Field For CV URL
instructorRequestSchema.virtual("cvURL").get(function () {
  if (this.cvFile && this.cvFile !== 'null') {
    return cloudinary.url(this.cvFile, { resource_type: "raw" });
  }
  return null;
});

module.exports = mongoose.model("InstructorRequest", instructorRequestSchema);
