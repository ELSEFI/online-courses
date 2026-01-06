const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { uploadImageToCloudinary } = require("../services/imageUpload");
const instructorProfile = require("../models/instructorProfile");
const { deleteFromCloudinary } = require("../services/cloudinaryDestroy");

exports.createCourse = async (req, res) => {
  const {
    titleEn,
    titleAr,
    shortDescEn,
    shortDescAr,
    descEn,
    descAr,
    requirementsEn,
    requirementsAr,
    price,
    discountPrice,
    instructorId,
    category,
    levelEn,
    levelAr,
  } = req.body;
  let uploadThumbnail = null;
  try {
    if (!req.file)
      return res.status(400).json({ message: "Course thumbnail is Required" });
    uploadThumbnail = await uploadImageToCloudinary(req.file.buffer, "Courses");

    const course = await Course.create({
      title: {
        en: titleEn,
        ar: titleAr,
      },
      shortDescription: {
        en: shortDescEn ?? undefined,
        ar: shortDescAr ?? undefined,
      },
      description: {
        en: descEn,
        ar: descAr,
      },
      requirements: {
        en: requirementsEn ? [requirementsEn] : undefined,
        ar: requirementsAr ? [requirementsAr] : undefined,
      },
      price: price ?? 0,
      discountPrice: discountPrice ?? undefined,
      instructor: instructorId,
      createdBy: req.user._id,
      category,
      level: {
        en: levelEn,
        ar: levelAr,
      },
      thumbnail: uploadThumbnail.public_id,
    });
    const instructor = await instructorProfile.findById(instructorId);
    if (!instructor)
      return res.status(404).json({ message: "Instructor Not Found" });
    res.status(201).json({ message: "Course Added Successfully", course });
  } catch (error) {
    if (uploadThumbnail) {
      await deleteFromCloudinary(uploadThumbnail.public_id);
    }
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Course with same name already exists",
      });
    }
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.getAllCourses = async (req, res) => {
  const { categoryId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  try {
    const allCategories = await getAllDescendantCategoryIds(categoryId);
    allCategories.push(categoryId);

    const filter = {
      status: true,
      isPublished: true,
      category: { $in: allCategories },
    };

    if (req.user.role !== "admin") {
      filter.isPublished = true;
    } else if (req.query.isPublished !== undefined) {
      filter.isPublished = req.query.isPublished === "true";
    }

    if (req.query.subCategory) {
      filter.category = req.query.subCategory;
    }

    if (req.query.level) {
      filter["level.en"] = req.query.level;
    }

    if (req.query.minRating) {
      filter.rating = { $gte: Number(req.query.minRating) };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === "rating") sort = { rating: -1 };
    if (req.query.sort === "popular") sort = { enrollmentCount: -1 };

    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      results: courses.length,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getCourse = async (req, res) => {
  const { courseSlug } = req.params;

  try {
    const filter = {
      slug: courseSlug,
      status: true,
      isPublished: true,
    };

    if (req.user?.role === "admin" && req.query.isPublished) {
      if (req.query.isPublished === "true") {
        filter.isPublished = true;
      } else if (req.query.isPublished === "false") {
        filter.isPublished = false;
      }
    }

    const course = await Course.findOne(filter);
    if (!course) return res.status(404).json({ message: "Course Not Found" });
    let enrollments = null;
    if (req.user.role === "admin" || course.instructor === req.user._id) {
      enrollments = await Enrollment.getCourseEnrollments(course._id);
    }

    res.status(200).json(course, enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.changePublishStatus = async (req, res) => {
  const { courseId } = req.params;
  const { isPublished } = req.body;

  try {
    if (typeof isPublished !== "boolean") {
      return res.status(400).json({ message: "isPublished must be boolean" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    course.isPublished = isPublished;
    course.publishedAt = isPublished ? new Date() : null;

    await course.save();

    res.status(200).json({
      message: isPublished
        ? "Course Published Successfully"
        : "Course Unpublished Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.updateCourse = async (req, res) => {
  const {
    titleEn,
    titleAr,
    shortDescEn,
    shortDescAr,
    descEn,
    descAr,
    requirementsEn,
    requirementsAr,
    price,
    discountPrice,
    instructorId,
    category,
    levelEn,
    levelAr,
  } = req.body;

  const { courseId } = req.params;
  let updatedThumbnail = null;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });
    let oldThumbnail = course.thumbnail;
    // Handle thumbnail
    if (req.file) {
      updatedThumbnail = await uploadToCloudinary(req.file.buffer, "Courses");
      course.thumbnail = updatedThumbnail.public_id;
    }

    course.title.en = titleEn ?? course.title.en;
    course.title.ar = titleAr ?? course.title.ar;

    course.shortDescription.en = shortDescEn ?? course.shortDescription.en;
    course.shortDescription.ar = shortDescAr ?? course.shortDescription.ar;

    course.description.en = descEn ?? course.description.en;
    course.description.ar = descAr ?? course.description.ar;

    if (requirementsEn) course.requirements.en = [requirementsEn];
    if (requirementsAr) course.requirements.ar = [requirementsAr];

    course.price = price ?? course.price;
    course.discountPrice = discountPrice ?? course.discountPrice;

    course.instructor = instructorId ?? course.instructor;
    course.category = category ?? course.category;

    course.level.en = levelEn ?? course.level.en;
    course.level.ar = levelAr ?? course.level.ar;

    await course.save();

    // delete old thumbnail AFTER save
    if (updatedThumbnail) {
      await deleteFromCloudinary(oldThumbnail);
    }

    res.status(200).json({ message: "Course Updated Successfully" });
  } catch (error) {
    if (updatedThumbnail) {
      await deleteFromCloudinary(updatedThumbnail.public_id);
    }

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Course with same title already exists" });
    }

    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    if (!course.status)
      return res.status(400).json({ message: "Course already deleted" });

    course.status = false;
    course.isPublished = false;

    await course.save();

    res.status(200).json({ message: "Course Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};

exports.restoreCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course Not Found" });

    if (course.status)
      return res.status(400).json({ message: "Course already active" });

    course.status = true;
    course.isPublished = false;

    await course.save();

    res.status(200).json({ message: "Course restored Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
