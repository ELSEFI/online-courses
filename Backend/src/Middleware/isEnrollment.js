const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

exports.isEnrollment = async (req, res, next) => {
  const { courseSlug } = req.params;
  try {
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    const enrollment = await Enrollment.findOne({
      course: course._id,
      user: req.user._id,
    });

    if (!enrollment) {
      return res
        .stats(403)
        .json({ message: "You Should Subscribe at Course To Open Content" });
    }
    req.enrollment = enrollment;
   return next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
