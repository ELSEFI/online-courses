const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Category = require("../models/Category");
const {
  sendEmail,
  sendResetPasswordEmail,
} = require("../services/emailSender");
const { uploadImageToCloudinary } = require("../services/imageUpload");
const { deleteFromCloudinary } = require("../services/cloudinaryDestroy");
const crypto = require("crypto");

exports.profile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const userRole = req.user.role;
    let enrichedUser = req.user.toObject();

    if (userRole === "instructor") {
      const InstructorProfile = mongoose.model("InstructorProfile");
      let profile = await InstructorProfile.findOne({ userId: req.user._id });
      if (profile) {
        await profile.updateStats();
        await profile.calculateRating();
        enrichedUser.instructorStats = {
          rating: profile.rating,
          studentsCount: profile.totalStudents,
          coursesCount: profile.totalCourses,
        };
      }
    } else if (userRole === "user") {
      const Enrollment = mongoose.model("Enrollment");
      const enrollmentCount = await Enrollment.countDocuments({ user: req.user._id });
      enrichedUser.studentStats = {
        enrolledCoursesCount: enrollmentCount,
      };
    } else if (userRole === "admin") {
      const Course = mongoose.model("Course");
      const User = mongoose.model("User");
      const totalCourses = await Course.countDocuments();
      const totalUsers = await User.countDocuments();
      enrichedUser.adminStats = {
        totalCourses,
        totalUsers,
      };
    }

    res.status(200).json({ user: enrichedUser });
  } catch (error) {
    console.error("Error in profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "name role profileImage email"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error + ${error}` });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (req.body.password || req.body.passwordConfirm)
      return res
        .status(400)
        .json({ message: "Not able to Change Password At this Route" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).json({ message: "User Not found" });

    const { name, email } = req.body;
    if (email) {
      const userWithEmail = await User.findOne({ email });
      if (
        userWithEmail &&
        userWithEmail._id.toString() !== user._id.toString()
      ) {
        return res.status(400).json({ message: "Email Used Before" });
      }
    }

    if (name) user.name = name;
    if (req.file) {
      const result = await uploadImageToCloudinary(req.file.buffer, "users");

      user.profileImage = result.public_id;
    }
    if (email && email !== user.email) {
      user.email = email;
      user.emailVerified = false;
      const code = Math.floor(100000 + Math.random() * 900000);
      user.verificationCode = code;
      user.verificationCodeExpire = Date.now() + 1000 * 60 * 10;
      await sendEmail(user.email, code);
      await user.save();
      return res.status(200).json({
        message:
          "Profile updated successfully and Please Sign in again to Verify your Email",
        user,
      });
    }
    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    // if (result) {
    //   await deleteFromCloudinary(result.public_id);
    // }
    console.error(error);
    res.status(500).json({ message: `Server Error + ${error}` });
  }
};



exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { status: false, email: null, tokenVersion: req.user.tokenVersion + 1 });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getHomeData = async (req, res) => {
  try {
    const { category } = req.query;
    let categoryIds = [];

    // 1. Fetch ALL root categories for the UI tabs (always needed for layout)
    const categories = await mongoose.model("Category").find({ parent: null, isActive: true }).select('name slug').lean();

    // 2. Determine category filtering if a category is provided (ID or Slug)
    if (category) {
      const targetCategory = await mongoose.model("Category").findOne({
        $or: [{ _id: mongoose.isValidObjectId(category) ? category : null }, { slug: category }]
      }).select("_id");

      if (targetCategory) {
        // Get all descendant category IDs to include courses from subcategories
        const descendants = await mongoose.model("Category").getAllDescendantIds(targetCategory._id);
        categoryIds = [targetCategory._id, ...descendants];
      }
    }

    const matchQuery = {
      status: true,
      isPublished: true,
    };

    if (categoryIds.length > 0) {
      matchQuery.category = { $in: categoryIds };
    }

    const data = await Course.aggregate([
      {
        $match: matchQuery,
      },
      {
        $facet: {
          topRatedCourses: [
            { $sort: { rating: -1 } },
            { $limit: 6 },
            {
              $lookup: {
                from: "instructorprofiles",
                localField: "instructor",
                foreignField: "_id",
                as: "instructor_profile",
              },
            },
            { $unwind: { path: "$instructor_profile", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "users",
                localField: "instructor_profile.userId",
                foreignField: "_id",
                as: "instructor_user",
              },
            },
            { $unwind: { path: "$instructor_user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                title: 1,
                slug: 1,
                thumbnailUrl: {
                  $cond: {
                    if: { $and: [{ $gt: ["$thumbnail", null] }, { $ne: ["$thumbnail", ""] }] },
                    then: { $concat: ["https://res.cloudinary.com/", process.env.CLOUDINARY_CLOUD_NAME || "", "/image/upload/", "$thumbnail"] },
                    else: null
                  }
                },
                price: 1,
                discountPrice: 1,
                rating: 1,
                enrollmentCount: 1,
                instructor: {
                  userId: {
                    name: "$instructor_user.name",
                    profileImage: {
                      $cond: {
                        if: { $and: [{ $gt: ["$instructor_user.profileImage", null] }, { $ne: ["$instructor_user.profileImage", ""] }] },
                        then: { $concat: ["https://res.cloudinary.com/", process.env.CLOUDINARY_CLOUD_NAME || "", "/image/upload/", "$instructor_user.profileImage"] },
                        else: "https://github.com/shadcn.png"
                      }
                    },
                  },
                },
              },
            },
          ],
          trendingCourses: [
            { $sort: { enrollmentCount: -1 } },
            { $limit: 8 },
            {
              $lookup: {
                from: "instructorprofiles",
                localField: "instructor",
                foreignField: "_id",
                as: "instructor_profile",
              },
            },
            { $unwind: { path: "$instructor_profile", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "users",
                localField: "instructor_profile.userId",
                foreignField: "_id",
                as: "instructor_user",
              },
            },
            { $unwind: { path: "$instructor_user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                title: 1,
                slug: 1,
                thumbnailUrl: {
                  $cond: {
                    if: { $and: [{ $gt: ["$thumbnail", null] }, { $ne: ["$thumbnail", ""] }] },
                    then: { $concat: ["https://res.cloudinary.com/", process.env.CLOUDINARY_CLOUD_NAME || "", "/image/upload/", "$thumbnail"] },
                    else: null
                  }
                },
                price: 1,
                discountPrice: 1,
                rating: 1,
                enrollmentCount: 1,
                instructor: {
                  userId: {
                    name: "$instructor_user.name",
                    profileImage: {
                      $cond: {
                        if: { $and: [{ $gt: ["$instructor_user.profileImage", null] }, { $ne: ["$instructor_user.profileImage", ""] }] },
                        then: { $concat: ["https://res.cloudinary.com/", process.env.CLOUDINARY_CLOUD_NAME || "", "/image/upload/", "$instructor_user.profileImage"] },
                        else: "https://github.com/shadcn.png"
                      }
                    },
                  },
                },
              },
            },
          ],
          topInstructors: [
            {
              $group: {
                _id: "$instructor",
                totalStudents: { $sum: "$enrollmentCount" },
                coursesCount: { $sum: 1 },
              },
            },
            { $sort: { totalStudents: -1 } },
            { $limit: 4 },
            {
              $lookup: {
                from: "instructorprofiles",
                localField: "_id",
                foreignField: "_id",
                as: "profile",
              },
            },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "users",
                localField: "profile.userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                totalStudents: 1,
                coursesCount: 1,
                "user.name": 1,
                "user.profileImage": {
                  $cond: {
                    if: { $and: [{ $gt: ["$user.profileImage", null] }, { $ne: ["$user.profileImage", ""] }] },
                    then: { $concat: ["https://res.cloudinary.com/", process.env.CLOUDINARY_CLOUD_NAME || "", "/image/upload/", "$user.profileImage"] },
                    else: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                  }
                },
                "profile.jobTitle": 1,
                "profile.rating": 1,
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        ...data[0],
        categories: categories || []
      }
    });
  } catch (error) {
    console.error("Error in Unified getHomeData Controller:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
