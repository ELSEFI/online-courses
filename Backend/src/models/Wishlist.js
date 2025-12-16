const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

wishlistSchema.statics.getUserWishlist = function (userId) {
  return this.find({ user: userId })
    .populate({
      path: "Course",
      populate: [
        { path: "instructor", select: "userId bio jobTitle rating" },
        { path: "category", select: "name" },
      ],
    })
    .sort({ addedAt: -1 });
};

module.exports = mongoose.model("Wishlist", wishlistSchema);
