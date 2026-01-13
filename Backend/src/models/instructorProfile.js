const mongoose = require("mongoose");
const instructorProfileSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
    },
    socials: {
      facebook: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/(www\.)?facebook\.com\/.+/.test(v);
          },
          message: "Invalid Facebook URL",
        },
      },
      linkedin: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
          },
          message: "Invalid LinkedIn URL",
        },
      },
      youtube: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/(www\.)?youtube\.com\/.+/.test(v);
          },
          message: "Invalid YouTube URL",
        },
      },
      twitter: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/.test(v);
          },
          message: "Invalid Twitter/X URL",
        },
      },
      website: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+\..+/.test(v);
          },
          message: "Invalid website URL",
        },
      },
    },
  },
  { timestamps: true }
);

// Calculating The Rate and Total Reviews
instructorProfileSchema.methods.calculateRating = async function () {
  const Course = mongoose.model("Course");
  const courses = await Course.find({ instructor: this._id });

  let totalRating = 0;
  let totalReviews = 0;

  courses.forEach((course) => {
    if (course.rating && course.totalReviews) {
      totalRating += course.rating * course.totalReviews;
      totalReviews += course.totalReviews;
    }
  });

  this.rating = totalReviews > 0 ? totalRating / totalReviews : 0;
  this.totalRatings = totalReviews;
  await this.save();
};

// Update The Stats Of Instructor(Total Courses and Total Students)
instructorProfileSchema.methods.updateStats = async function () {
  const Course = mongoose.model("Course");
  const courses = await Course.find({ instructor: this._id });

  this.totalCourses = courses.length;
  this.totalStudents = courses.reduce((acc, course) => acc + (course.enrollmentCount || 0), 0);

  await this.save();
};

module.exports = mongoose.model("InstructorProfile", instructorProfileSchema);
