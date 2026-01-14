const Course = require("../models/Course");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../services/imageUpload");
const instructorProfile = require("../models/instructorProfile");
const { deleteFromCloudinary } = require("../services/cloudinaryDestroy");

async function getAllDescendantCategoryIds(categoryId) {
  const children = await Category.find({ parent: categoryId }).select("_id");
  let ids = children.map((child) => child._id);
  for (const child of children) {
    const childIds = await getAllDescendantCategoryIds(child._id);
    ids = ids.concat(childIds);
  }
  return ids;
}

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
    let filter = {
      status: true,
      isPublished: true,
    };

    if (categoryId && categoryId !== "all") {
      const descendantIds = await getAllDescendantCategoryIds(categoryId);
      filter.category = { $in: [categoryId, ...descendantIds] };
    }

    // 🎯 Textual Search (Query: q)
    if (req.query.q) {
      const searchRegex = { $regex: req.query.q, $options: "i" };
      filter.$or = [
        { "title.en": searchRegex },
        { "title.ar": searchRegex },
        { "description.en": searchRegex },
        { "description.ar": searchRegex },
        { "shortDescription.en": searchRegex },
        { "shortDescription.ar": searchRegex }
      ];
    }

    if (req.query.subCategory) {
      const subCategory = await Category.findOne({ slug: req.query.subCategory });
      if (subCategory) {
        filter.category = subCategory._id;
      }
    }

    if (req.query.level) {
      filter["level.en"] = req.query.level;
    }

    if (req.query.price) {
      if (req.query.price === 'free') {
        filter.price = 0;
      } else if (req.query.price === 'paid') {
        filter.price = { $gt: 0 };
      }
    }

    if (req.query.rating) {
      filter.rating = { $gte: Number(req.query.rating) };
    }

    // Sorting
    let sort = {};
    if (req.query.sort === 'popular') {
      sort = { enrollmentCount: -1 };
    } else if (req.query.sort === 'rating') {
      sort = { rating: -1 };
    } else if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sort === 'price_low') {
      sort = { price: 1 };
    } else if (req.query.sort === 'price_high') {
      sort = { price: -1 };
    } else {
      sort = { createdAt: -1 };
    }

    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate([
        {
          path: "instructor",
          select: "rating totalCourses userId",
          populate: {
            path: "userId",
            select: "name email role",
          },
        },
        {
          path: "category",
          select: "name slug",
        },
        {
          path: "createdBy",
          select: "name email role",
        },
      ]);

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCourses: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in getAllCourses:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.getCourse = async (req, res) => {
  const { courseSlug } = req.params;

  try {
    const course = await Course.findOne({
      slug: courseSlug,
      status: true,
      isPublished: true,
    }).populate([
      {
        path: "instructor",
        select: "rating totalCourses userId",
        populate: {
          path: "userId",
          select: "name email role profileImage",
        },
      },
      {
        path: "category",
        select: "name slug",
      },
      {
        path: "createdBy",
        select: "name email role",
      },
    ]);

    if (!course) return res.status(404).json({ message: "Course Not Found" });

    res.status(200).json({ course });
  } catch (error) {
    console.error("Error in getCourse:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
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

exports.getAllCoursesNonPublished = async (req, res) => {
  try {
    const filter = {
      status: true,
      isPublished: false,
    };
    const courses = await Course.find(filter);
    if (courses.length === 0)
      return res.status(200).json({ message: "No UnPublished Courses" });

    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error ${error.message}` });
  }
};
