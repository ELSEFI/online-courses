const Course = require("../models/Course");
const Wishlist = require("../models/Wishlist");

exports.addWishlist = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    const wishlist = await Wishlist.create({
      user: req.user._id,
      course: course._id,
      addedAt: new Date(),
    });
    res.status(200).json({ message: "Added To Wishlist Successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Already Added This Course To Your Wishlist ",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.GetWishlist = async (req, res) => {
  try {
    const userId = req.params.userId ? req.params.userId : req.user._id;
    const wishlist = await Wishlist.getUserWishlist(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.deleteWishlist = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    await Wishlist.findOneAndDelete({
      user: req.user._id,
      course: course._id,
    });
    res.status(200).json({ message: "Remove From Wishlist Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
