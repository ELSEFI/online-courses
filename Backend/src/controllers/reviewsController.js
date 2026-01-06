const Course = require("../models/Course");
const Review = require("../models/Reviews");

exports.addReview = async (req, res) => {
  const { courseSlug } = req.params;
  const { userRate } = req.body;
  try {
    const course = await Course.findOne({
      slug: courseSlug,
      isPublished: true,
      status: true,
    });
    if (!course) return res.status(404).json({ message: "Course Not Found" });
    if (req.user.role !== "user") {
      res.status(403).json({ message: "Your Not Allowed To Add Review" });
    }
    const review = await Review.create({
      user: req.user._id,
      course: course._id,
      review: req.body.review ?? null,
      rating: userRate,
    });
    res.status(200).json({ message: "Your Review Added Successfully", review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Your Already Rate This Course",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getReviews = async (req, res) => {
  const { courseSlug } = req.body;
  try {
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return res.status(404).json({ message: "Course Not Found" });
    let filter = {
      course: course._id,
    };
    if (req.query.rating) {
      filter.rating.$eq = Number(req.query.rating);
    }
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name profileImage");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.deleteReview = async (req, res) => {
  const { reviewId } = req.body;
  try {
    const review = await Review.findById(reviewId);

    if (req.user.role === "user" && review.user !== req.user._id) {
      res
        .status(404)
        .json({ message: "Your Not Allow To Delete That Comment" });
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
