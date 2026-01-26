const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
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
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  },
  { timestamps: true }
);

// Post-save: Update instructor stats
enrollmentSchema.post("save", async function () {
  const Course = mongoose.model("Course");
  const InstructorProfile = mongoose.model("InstructorProfile");

  const course = await Course.findById(this.course);
  if (course) {
    const instructor = await InstructorProfile.findById(course.instructor);
    if (instructor) {
      await instructor.updateStats();
    }
  }
});

// Method: Update progress
enrollmentSchema.methods.updateProgress = async function () {
  const Lesson = mongoose.model("Lesson");
  const Section = mongoose.model("Section");

  // Fetch all active sections for this course
  const sections = await Section.find({
    course: this.course,
    isActive: true
  }).select("_id");

  const sectionIds = sections.map((s) => s._id);

  // Count total active lessons in all sections
  const totalLessons = await Lesson.countDocuments({
    section: { $in: sectionIds },
    isActive: true,
  });

  if (totalLessons > 0) {
    this.progress = Math.round(
      (this.completedLessons.length / totalLessons) * 100
    );

    // Mark as completed if 100%
    if (this.progress === 100 && !this.completedAt) {
      this.completedAt = new Date();
    }
  }

  this.lastAccessedAt = new Date();
  await this.save();
};

// Method: Mark lesson as completed
enrollmentSchema.methods.completeLesson = async function (lessonId) {
  if (!this.completedLessons.includes(lessonId)) {
    this.completedLessons.push(lessonId);
    this.lastAccessedLesson = lessonId;
    await this.updateProgress();
  }
};

// Post-save: Update course enrollment count
enrollmentSchema.post("save", async function () {
  const Course = mongoose.model("Course");
  const course = await Course.findById(this.course);
  if (course) {
    course.enrollmentCount = await mongoose
      .model("Enrollment")
      .countDocuments({ course: this.course });
    await course.save();
  }
});

// Static: Get user's enrolled courses
enrollmentSchema.statics.getUserCourses = function (userId) {
  return this.find({ user: userId })
    .populate({
      path: "course",
      populate: [
        { path: "instructor", select: "userId bio jobTitle rating" },
        { path: "category", select: "name" },
      ],
    })
    .sort({ lastAccessedAt: -1 });
};

// Static: Get course enrollments
enrollmentSchema.statics.getCourseEnrollments = function (courseId) {
  return this.find({ course: courseId })
    .populate("user", "name email profileImage")
    .sort({ enrolledAt: -1 });
};
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
