const Course = require("../models/Course");
exports.isCourseOwner = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: "No Course Found" });
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not allowed to access this course" });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}